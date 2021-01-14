# The GitThingsDone Official Client

A one-stop shop for all of your productivity needs!

**COMING SOON:** [About the GitThingsDone Philosophy](#)

**COMING SOON:** Click here to go to the [GitThingsDone Official Server](#).


## About the GitThingsDone Project

GitThingsDone is a (currently theoretical) modular framework that makes it easy to track, plan, and log tasks and events.

Inspired by their counterparts in software development, GitTD organizes all tasks under two main categories: **commits** and **promises**.

A **commit** represents any task that has _already_ been completed, and can be seen as analogous to existing productivity structures such as:
 - A checked off item on a todo list
 - A completed card on a kanban board
 - A scheduled event that already occurred
The existence of commits allows for the existence of activity logs, data visualizations, and progress trackers.

A **promise** represents any task that is scheduled, but has yet to be complete. When the task is finished, the Promise will subsequently be converted into a Commit.
If a Promise has a deadline that is not met, it will become a *broken promise* that can be rescheduled or retroactively completed.


GitThingsDone has three main tenets:
1. **Modularity.** Keep the core slim and the possibilities of extension endless.
2. **Customizability.** Productivity tools should work exactly how you want. Unnecessary features and that one thing that irks you just throws everything off.
3. **Community.** The amount of modules needed to make this a complete ecosystem is prohibitive for a single team to develop and maintain. It should be easy and rewarding for developers to build off of GitTD to work for themselves.

**COMING SOON:** To learn more about the GitTD philosophy, [visit this document](#).

## The purpose of this repository

This repository showcases a potential implementation of GitTD on the client side. It is highly encouraged for you to extend this client or create your own if it does not suit your needs. The main components being showcased are:
 - **The Omnibar:** Soon to be separated into its own React component, the Omnibar is an intelligent Promise and Commit creation tool that translates human-friendly language (like 'Dentist Appointment at 3:00PM tomorrow' or 'Worked on history project for 25 minutes') into their corresponding GitTD structures. It captures language based on an easily extendable dictionary (more info coming soon) which makes it suitable as an input for any extension of GitTD.
 - **App Integrations:** GitTD has the capacity to interface with popular productivity tools, such as Todoist and Google Calendar.
 - **Pomodoro:** A popular and effective productivity method, Pomodoro can be made even better by rewarding work sessions with Commits at the end (or by fulfilling a Promise made at the beginning).

Eventually, all of these components will be separated from this project, but for now this client will serve as a proof-of-concept for GitTD.

## The current status

This client (and the whole of GitThingsDone) is currently in its very early stages of planning and development. Don't expect anything usable or substantive until much later on. The current plan is to first create a non-modular non-customizable app that at least works and is helpful for productivity, then come back and make it easier for others to use and make their own.

## About the creator

GitThingsDone is a project imagined by me, [Ben Cuan](https://bencuan.me). If you would like to either contribute or alpha-test in the early stages of GitThingsDone, please email me at [contact@bencuan.me](mailto:contact@bencuan.me) and we can get in touch!
