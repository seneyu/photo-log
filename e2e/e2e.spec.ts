import { test, expect } from "@playwright/test";

let testCaption = "";

test.afterEach("clean up by deleting the test post", async ({ page }) => {
  if (!testCaption) return;

  // intercept the native window.confirm box and click 'OK'
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "confirm") await dialog.accept();
  });

  const targetThumbnail = page
    .getByRole("img", { name: new RegExp(testCaption, "i") })
    .first();
  await targetThumbnail.click();

  const deleteButton = page.getByLabel("Delete pin");
  await deleteButton.click();

  await expect(page.getByText(testCaption)).toHaveCount(0);
});

test("user can login and upload a pin", async ({ page }) => {
  // step 1: navigate to the login page
  await page.goto("/");
  await page.click("text=Log In");
  await expect(page).toHaveURL("/login");

  // step 2: log in with testing account
  await page.fill(
    'input[name="email"]',
    process.env.PLAYWRIGHT_TESTING_EMAIL as string,
  );
  await page.fill(
    'input[name="password"]',
    process.env.PLAYWRIGHT_TESTING_PASSWORD as string,
  );

  // await page.click('button[type="submit"]');
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("/map");

  await expect(page.locator("text=Add Pin")).toBeVisible();

  testCaption = `Testing-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // step 3: fill out the form and upload a file
  await page.getByRole("button", { name: "Add Pin" }).click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("e2e/fixtures/test-photo.jpg");
  await expect(fileInput).toHaveValue(/test-photo\.jpg$/);

  await page
    .getByPlaceholder("e.g. Shot on Portra 400, f/2.8 at golden hour...")
    .fill(testCaption);

  await page
    .getByPlaceholder("e.g. Golden Gate Park, San Francisco")
    .fill("de Young Museum");

  const suggestion = page
    .locator("#suggestions li")
    .filter({ hasText: "de Young Museum" })
    .first();
  await expect(suggestion).toBeVisible();
  await suggestion.click();

  await page.fill('input[type="date"]', "2026-01-01");

  // step 4: submit and assert updates
  await page.getByRole("button", { name: "Post" }).click();
  await expect(page.locator("#modal")).toBeHidden();

  const newPost = page.getByRole("img", {
    name: new RegExp(testCaption, "i"),
  });
  await expect(newPost).toBeVisible();
});
