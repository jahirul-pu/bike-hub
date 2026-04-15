# Supabase Keep-Alive Setup (No Hosting Required)

Since you haven't hosted the project yet, I've updated the setup to work directly from GitHub. This will ping your Supabase database every few days to prevent it from pausing.

## Components Added

1.  **Direct Script**: `scripts/keep-alive.ts`
    *   A simple TypeScript script that connects to your database and runs a `SELECT 1` query.
2.  **GitHub Action**: `.github/workflows/keep-alive.yml`
    *   This workflow runs twice a week (Tuesday and Friday).
    *   It installs necessary dependencies and runs the keep-alive script directly from GitHub's servers.

## Final Steps Required

You only need to add one secret to your GitHub repository:

### 1. In GitHub Secrets
Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:

*   **Name**: `DATABASE_URL`
*   **Value**: Paste your Supabase connection string here (the one you use in your `.env` file).

> [!IMPORTANT]
> Make sure the connection string is the **Transaction Mode** or **Direct** connection string from Supabase (usually starts with `postgres://` or `postgresql://`).

---

### How to Test
1.  Push these changes to your GitHub repository.
2.  Go to the **Actions** tab in your repository.
3.  Select **Database Keep Alive (Direct)** from the left sidebar.
4.  Click **Run workflow** -> **Run workflow**.

Once it finishes, look at the logs. You should see "Successfully pinged database". Your database will now stay active indefinitely!
