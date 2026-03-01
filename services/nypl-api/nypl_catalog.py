"""Playwright automation for NYPL Vega catalog (borrow.nypl.org).

Handles catalog search, availability checking, login, hold placement,
and account management.
"""

import os
from playwright.async_api import async_playwright, Browser, BrowserContext, Page

NYPL_BASE = "https://borrow.nypl.org"

# Persistent browser state (reused across tool calls within a session)
_playwright_instance = None
_browser: Browser | None = None
_context: BrowserContext | None = None
_logged_in = False


async def _get_context() -> BrowserContext:
    """Get or create a persistent browser context."""
    global _playwright_instance, _browser, _context
    if _context is None:
        _playwright_instance = await async_playwright().start()
        _browser = await _playwright_instance.chromium.launch(headless=True)
        _context = await _browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )
    return _context


async def _new_page() -> Page:
    """Get a new page in the persistent context."""
    ctx = await _get_context()
    return await ctx.new_page()


async def _login_vega(page: Page) -> bool:
    """Log into NYPL via Vega's CAS auth flow. Returns True on success.

    Flow: borrow.nypl.org → click Log in → click Sign in →
    ilsstaff.nypl.org/iii/cas/login → fill card + PIN → submit →
    redirect back to borrow.nypl.org (logged in).
    """
    global _logged_in
    if _logged_in:
        return True

    card_number = os.environ.get("NYPL_CARD_NUMBER", "")
    pin = os.environ.get("NYPL_PIN", "")
    if not card_number or not pin:
        return False

    # Go to borrow.nypl.org
    await page.goto(NYPL_BASE, timeout=60000)
    await page.wait_for_load_state("networkidle", timeout=30000)
    await page.wait_for_timeout(2000)

    # Click "Log in" to open dropdown
    await page.locator("#user-login-button").click()
    await page.wait_for_timeout(1000)

    # Click "Sign in" in the dropdown — triggers CAS redirect
    sign_in = page.get_by_role("button", name="Sign in")
    if await sign_in.count() == 0:
        return False

    async with page.expect_navigation(timeout=15000):
        await sign_in.click()

    await page.wait_for_load_state("networkidle", timeout=15000)

    # Fill login form (ilsstaff.nypl.org/iii/cas/login)
    code_input = page.locator("input#code")
    pin_input = page.locator("input#pin")

    if await code_input.count() == 0 or await pin_input.count() == 0:
        return False

    await code_input.fill(card_number)
    await pin_input.fill(pin)
    await page.get_by_role("button", name="Submit").click()

    # Wait for redirect back to borrow.nypl.org
    await page.wait_for_timeout(3000)
    await page.wait_for_load_state("networkidle", timeout=15000)

    # Verify login — button should show patron name instead of "Log in"
    login_btn = page.locator("#user-login-button")
    btn_text = (await login_btn.inner_text()).strip()
    if btn_text != "Log in":
        _logged_in = True
        return True

    return False


async def check_availability(title: str, isbn: str | None = None) -> str:
    """Search NYPL catalog and return availability by branch."""
    page = await _new_page()
    try:
        search_term = isbn or title
        url = f"{NYPL_BASE}/search?query={search_term}&searchType=everything"
        await page.goto(url, timeout=60000)
        await page.wait_for_load_state("networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # Check if we got results
        cards = page.locator("a[href*='/search/card']")
        card_count = await cards.count()
        if card_count == 0:
            return f"No results found in NYPL catalog for '{search_term}'."

        # Get first result info
        first_title = (await cards.nth(1).inner_text()).strip()
        first_card_href = await cards.nth(1).get_attribute("href")

        # Collect locations (filter out non-branch items)
        location_els = page.locator(".location-link")
        loc_count = await location_els.count()
        locations = []
        for i in range(min(loc_count, 20)):
            loc_text = (await location_els.nth(i).inner_text()).strip()
            if loc_text and "Find a copy" not in loc_text and "See all" not in loc_text:
                locations.append(loc_text)

        # Get holds/copies info
        holds_els = page.locator(".holds-and-copies")
        holds_text = ""
        if await holds_els.count() > 0:
            holds_text = (await holds_els.first.inner_text()).strip()

        # Build output
        lines = [f"NYPL Catalog: **{first_title}**\n"]
        if holds_text:
            lines.append(f"Demand: {holds_text}")
        if locations:
            lines.append(f"\nAvailable at {len(locations)} branches:")
            for loc in locations:
                lines.append(f"  - {loc}")
        if first_card_href:
            lines.append(f"\nCatalog link: {NYPL_BASE}{first_card_href}")

        return "\n".join(lines)

    except Exception as e:
        return f"Error searching NYPL catalog: {e}"
    finally:
        await page.close()


async def place_hold(title: str, pickup_branch: str, isbn: str | None = None) -> str:
    """Place a hold on a book at NYPL."""
    card_number = os.environ.get("NYPL_CARD_NUMBER", "")
    pin = os.environ.get("NYPL_PIN", "")
    if not card_number or not pin:
        return "NYPL credentials not configured. Set NYPL_CARD_NUMBER and NYPL_PIN environment variables."

    page = await _new_page()
    try:
        # Login if needed
        if not _logged_in:
            success = await _login_vega(page)
            if not success:
                return "Login failed. Check NYPL_CARD_NUMBER and NYPL_PIN."

        # Search for the book
        search_term = isbn or title
        url = f"{NYPL_BASE}/search?query={search_term}&searchType=everything"
        await page.goto(url, timeout=60000)
        await page.wait_for_load_state("networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # Click into first result
        cards = page.locator("a[href*='/search/card']")
        if await cards.count() < 2:
            return f"Book not found in NYPL catalog: '{search_term}'"

        book_title = (await cards.nth(1).inner_text()).strip()
        await cards.nth(1).click()
        await page.wait_for_load_state("networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # Click "Request Any Edition"
        request_btn = page.get_by_role("button", name="Request Any Edition")
        if await request_btn.count() == 0:
            return "Could not find 'Request Any Edition' button. The book may not be available for holds."

        await request_btn.click()
        await page.wait_for_timeout(3000)
        await page.wait_for_load_state("networkidle", timeout=15000)

        # Handle branch selection if dropdown appears
        branch_select = page.locator("select#choose-pickup-location")
        if await branch_select.count() > 0:
            # Get all options and find best match
            options = await branch_select.locator("option").all_text_contents()
            target = None
            # Try exact match first
            for opt in options:
                if opt.strip() == pickup_branch:
                    target = opt.strip()
                    break
            # Then fuzzy match
            if not target:
                for opt in options:
                    if pickup_branch.lower() in opt.lower():
                        target = opt.strip()
                        break
            if target:
                await branch_select.select_option(label=target)
            else:
                return f"Branch '{pickup_branch}' not found. Available: {', '.join(o.strip() for o in options[:10])}"

        # Confirm location
        confirm_btn = page.get_by_role("button", name="Confirm Location")
        if await confirm_btn.count() > 0:
            await confirm_btn.click()
            await page.wait_for_timeout(3000)
        else:
            # Fallback to generic Confirm
            confirm_btn = page.get_by_role("button", name="Confirm")
            if await confirm_btn.count() > 0:
                await confirm_btn.click()
                await page.wait_for_timeout(3000)

        # Check result
        body_text = await page.inner_text("body")
        if "success" in body_text.lower() or "confirmed" in body_text.lower():
            return f"Hold placed successfully!\n  Book: {book_title}\n  Pickup: {pickup_branch}"
        elif "already" in body_text.lower():
            return f"You already have a hold on '{book_title}'."
        else:
            await page.screenshot(
                path="debug_hold.png"
            )
            return (
                f"Hold request submitted for '{book_title}' at {pickup_branch}. "
                "Check get_my_holds() to confirm. "
                "(Debug screenshot saved to debug_hold.png)"
            )

    except Exception as e:
        return f"Error placing hold: {e}"
    finally:
        await page.close()


async def get_holds_and_checkouts() -> str:
    """Get current holds and checkouts from NYPL account."""
    card_number = os.environ.get("NYPL_CARD_NUMBER", "")
    pin = os.environ.get("NYPL_PIN", "")
    if not card_number or not pin:
        return "NYPL credentials not configured. Set NYPL_CARD_NUMBER and NYPL_PIN environment variables."

    page = await _new_page()
    try:
        # Login if needed
        if not _logged_in:
            success = await _login_vega(page)
            if not success:
                return "Login failed. Check NYPL_CARD_NUMBER and NYPL_PIN."
        else:
            await page.goto(NYPL_BASE, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(5000)

        # Expand the bookshelf bar at the bottom
        expand = page.locator("[aria-label='Expand bookshelf']")
        if await expand.count() > 0 and await expand.is_visible():
            await expand.click()
            await page.wait_for_timeout(2000)

        # Open account panel by clicking user button, then click CHECKOUTS
        user_btn = page.locator("#user-login-button")
        await user_btn.click()
        await page.wait_for_timeout(1000)

        # Click CHECKOUTS in the account dropdown to switch to account view
        co_text = page.get_by_text("CHECKOUTS")
        if await co_text.count() > 0 and await co_text.first.is_visible():
            await co_text.first.click()
            await page.wait_for_timeout(3000)

        lines = ["**Your NYPL Account**\n"]

        # Extract checkouts from account tab content
        # The last .account-tab element contains the full checkout list as text
        account_tabs = page.locator("[class*='account-tab']")
        checkout_text = ""
        for i in range(await account_tabs.count()):
            text = (await account_tabs.nth(i).inner_text()).strip()
            if text.startswith("Checkouts |"):
                checkout_text = text
                break

        if checkout_text:
            # Parse structured text: Title\nBOOK/TEXT\nChecked out Date\nDate\nDue Date\nDate\nRenewed X times\nRenew
            import re
            blocks = re.split(r"\nRenew\n|\nRenew$", checkout_text)
            checkouts = []
            for block in blocks:
                block_lines = [l.strip() for l in block.split("\n") if l.strip()]
                title = ""
                due = ""
                renewed = ""
                for j, line in enumerate(block_lines):
                    if line == "Due Date" and j + 1 < len(block_lines):
                        due = block_lines[j + 1]
                    elif line.startswith("Renewed"):
                        renewed = line
                    elif line not in ("BOOK/TEXT", "Checked out Date", "Due Date",
                                      "Renew Items", "Renew") \
                            and "Sorted by" not in line \
                            and "Checkouts |" not in line \
                            and not re.match(r"^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d", line):
                        if not title:
                            title = line
                if title:
                    checkouts.append({"title": title, "due": due, "renewed": renewed})

            if checkouts:
                lines.append(f"CHECKOUTS ({len(checkouts)}):")
                for item in checkouts:
                    due = f" — due {item['due']}" if item['due'] else ""
                    renewed = f" ({item['renewed']})" if item['renewed'] else ""
                    lines.append(f"  - {item['title']}{due}{renewed}")

        # Switch to Requests tab by clicking the label
        req_labels = page.locator("[class*='account-tab-label']")
        for i in range(await req_labels.count()):
            text = (await req_labels.nth(i).inner_text()).strip()
            if "Requests" in text and await req_labels.nth(i).is_visible():
                await req_labels.nth(i).click()
                await page.wait_for_timeout(3000)
                break

        # Get request content from the active account tab panel
        for i in range(await account_tabs.count()):
            text = (await account_tabs.nth(i).inner_text()).strip()
            if "Requests |" in text and "Cancel Request" in text:
                import re
                # Split by "Cancel Request" to get individual request blocks
                blocks = re.split(r"Cancel Request", text)
                requests = []
                skip_words = {"Place in line", "Request expires on", "BOOK/TEXT",
                              "E-BOOK from OverDrive", "AUDIOBOOK", "Cancel Request",
                              "Book", "Pickup location", "Cancel"}
                for block in blocks:
                    b_lines = [l.strip() for l in block.split("\n") if l.strip()]
                    title = ""
                    status = ""
                    branch = ""
                    expires = ""
                    for j, line in enumerate(b_lines):
                        if "Requests |" in line or "Sorted" in line:
                            continue
                        if line in skip_words:
                            continue
                        if re.match(r"^\d+ - (Waiting|Ready|In Transit)", line):
                            status = line
                            continue
                        if "Library" in line or "SNFL" in line or "Online" in line:
                            branch = line
                            continue
                        if re.match(r"^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d", line):
                            expires = line
                            continue
                        if not title and len(line) > 3:
                            title = line
                    if title:
                        details = []
                        if status:
                            details.append(status)
                        if branch:
                            details.append(branch)
                        if expires:
                            details.append(f"expires {expires}")
                        detail_str = f" ({', '.join(details)})" if details else ""
                        requests.append(f"{title}{detail_str}")

                if requests:
                    lines.append(f"\nREQUESTS ({len(requests)}):")
                    for req in requests:
                        lines.append(f"  - {req}")
                break

        has_data = any("CHECKOUTS" in l or "REQUESTS" in l for l in lines)
        if not has_data:
            lines.append("No checkouts or requests found.")

        return "\n".join(lines)

    except Exception as e:
        return f"Error checking account: {e}"
    finally:
        await page.close()


async def cleanup():
    """Close browser on shutdown."""
    global _playwright_instance, _browser, _context, _logged_in
    if _browser:
        await _browser.close()
    if _playwright_instance:
        await _playwright_instance.stop()
    _browser = None
    _context = None
    _playwright_instance = None
    _logged_in = False
