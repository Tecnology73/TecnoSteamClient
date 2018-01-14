# TecnoSteamClient

**WARNING** This project is a WIP and DOES CONTAIN BUGS. The client is by NO MEANS stable.

**Use this program at your own risk.**

The client is basically entirely relient on the server I created. You can view the code for this at the repository [here](https://github.com/73cn0109y/TecnoSteam).

## Table of Contents
* [Disclosure](#disclosure)
* [Description](#description)
* [Features](#features)
    * [Advanced Search](#advanced-search)
* [Setup](#setup)
* [Run](#run)
* [Road Block](#road-block)

## Disclosure
There is some personal information stored on the server that is pulled from the Steam API. You can check out what exactly will be stored by checking out the database migrations on the server repository [here](https://github.com/73cn0109y/TecnoSteam/tree/master/database/migrations).

Your login token, password and 2FA code does **NOT** get sent to the server and are stored as a file named login_key in the projects root directory. If you don't believe me... look through the code for yourself.

Here is a short run-down of what might get stored;
- Nickname, Name, Avatar, Country, State, City, Account Creation Date
- Friends (information about each friend is the same as above)
    - *NOTE: It's only setup to log friends one level deep. So we log your friends, but not friends of your friends*
- Games you own (and games your friends own)
    - Achievements (both locked and unlocked)
    - Statistics (e.g. Arrows fired, Shots fired, etc.)
- Categories
    - The categories you use in the client get stored server-side.
        - Didn't get around to implmenting much client-side/offline stuff
        - Note sure if categories is actually working...

## Description
TecnoSteam is based upon the Steam client from [this concept](https://mrtomone.deviantart.com/art/Origami-OS-2-4-2-Concept-Update-556728058) (by mrtomone), which is also based upon [this concept](https://bannax1994.deviantart.com/art/Steam-on-Windows-10-Concept-548144691) (by bannax1994). I, in no way, take credit for these concepts and all credit should go to it's original creator where it is due.

I started this project because the current Steam client looks out-dated and I personally wanted something that looked nicer. I liked the fact that I could create a client and would have control over what it looked like, how it acted and the ability to implement any level of customization.

I've decided to make this project Open-Source after running into a fairly significant road block [\[2\]](#road-block), in hopes that someone in the community can figure it out and so others can improve upon my code. There is a strong chance that this will get shut down by Valve but hopefully they support this or I can hope this pushes them a little bit to update their out-dated (imo) client.


## Features
As of writing this I have implemented the following (although probbaly not in the best way or half broken);

- Login with Two Factor Authentication support (via mobile app, others have NOT been tested)
- Library View
    - Friends - See who owns the same game. Will also show their status (Playing, Busy, Away, etc.)
    - Achievements - Will show (un)locked progress and the badges of some achievements
    - News - View the most recent news for the game
- Friends
    - List friends sorted by status (Playing, Away, Online, etc.)
    - Advanced search functionality [\[1\]](#advanced-search)
    - Ability to chat
- Ability to install/launch games. (Launching games still requries Steam to be running.)

#### Advanced Search
The friends window has a search feature that supports more refined searching.
Here are some examples:

`frank` - Show only friends whos name contains frank (Matches "frank", "abcfrank", "abcfrankabc", etc.)

`state:offline` - Show only friends who are offline.

`state:in-game frank` - Show only friends who are In-Game and whos name contains frank.

`game:rust` - Show only friends who are playing a game with the name containing "rust".

## Setup
1. Run `npm install` OR `yarn`

## Run
2. Run one of the following;

    **DEVELOPMENT** - `npm run dev-server` OR `yarn dev-server`

    **PRODUCTION** - `npm run build` OR `yarn build`

    *NOTE: Production has issues reading project files! It may be best to just run as development until this issue is solved.*

3. Run `npm start` or `yarn start`

## Road Block
Straight to the point - I rage quit this project because of an annoying issues I was having.

*NOTE: It has been some months since working on this project and I've forgotten all the technical wording. Hopefully someone who is reading this understand what I'm trying to say :P*

Whilst trying to implement a progress bar for downloading/installing/updating games, I came across a widely known annoyance in regards to using steamcmd. The issue is that it doesn't flush the text to the console immediately. Instead, it'll wait for a rather large amount of text to be in the buffer before showing it in the console. This makes it extremely difficult for reading things like progress, because it just sits in the buffer making it almost impossible to read.

There are tricks to get around this like doing `app_list` (I've forgotten the exact command) but this doesn't work for what I'm trying to accomplish here.

If someone can figure this out then this will be a HUGE step forward for this project. IIRC, you'll have to do some low-level Win32 API shit and basically hack away at steamcmd or try to interface with the dll directly (I've tried but with my limited C++ knowledge, didn't end well for my keyboard).
