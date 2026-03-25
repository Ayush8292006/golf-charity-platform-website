
- Golf4Good - Golf Charity Subscription Platform


- About This Project
        I built this platform to combine my love for golf with giving back to the community. It's a full-stack web application where golfers can track their scores, subscribe to monthly or yearly plans, participate in prize draws, and support charities they care about.

Live Demo:  golf-charity-platform-website.vercel.app

- What This Platform Does


For Golfers (Regular Users)


- For Admins
        Feature	What It Does
        User Management	See all registered users, their emails, and join dates
        Charity Management	Add, edit, or remove charities. Mark featured charities
        Draw Management	Run monthly draws, simulate draws before publishing
        Winner Management	Verify winners, mark payouts as completed
        Reports	See total users, subscriptions, revenue, and draw statistics
        Settings	Change platform name, prices, and other configurations



Tech Stack I Used
Layer	Technology
            Frontend	Next.js 15, TypeScript, Tailwind CSS
            Backend	Supabase (PostgreSQL)
            Authentication	Supabase Auth (Email/Password)
            Payment	Dummy Stripe gateway (demo mode)
            Hosting	Vercel
            Version Control	Git & GitHub


How the Score System Works
When a golfer enters a score:

        Score must be between 1-45 (Stableford format)

        Must include a date

        System keeps only last 5 scores

        New score automatically replaces the oldest

        Scores display most recent first

- How the Draw System Works
        Every month, admin can run a draw:

        5 random numbers are generated (1-50)

        Prize distribution:

        40% for 5-number match (jackpot rollover if no winner)

        35% for 4-number match

        25% for 3-number match

        Winners are automatically determined and saved

        Admin verifies winners and marks payouts

- How I Structured the Database
        Table	What It Stores
        profiles	User details (name, email, golf club)
        subscriptions	User plans, status, renewal dates
        scores	Golf scores with dates
        charities	Charity listings with descriptions
        draws	Monthly draw results and winning numbers
        winners	Draw winners with prize amounts


- Performance
    I ran Lighthouse tests to check performance:

    Metric	Score
        Performance	99
        Accessibility	89
        Best Practices	100
        SEO	100





- Admin Access
        To access admin panel, sign up with admin@example.com or have an admin add you. Admin panel URL: /admin

- What I Learned Building This
        Building this project taught me:

        How to work with Next.js App Router

        Setting up authentication with Supabase

        Managing PostgreSQL tables and relationships

        Implementing dummy payment flows

        Building admin dashboards

        Making responsive designs that work on all devices

- Challenges I Faced
        Getting RLS policies right so users only see their own data

        Making the score system automatically replace oldest scores

        Calculating rank based on all players' best scores

        Making the admin panel show real-time stats

- Future Improvements
        If I had more time, I would add:

        Real Stripe payment integration

        Email notifications for draw results

        Mobile app version

        More detailed analytics