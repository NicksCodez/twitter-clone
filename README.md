## INTRO

This is a Twitter clone built using React with Firebase for the    Backend. I've built this web app to test my skills and further my    learning. There are some visual glitches and incomplete styles, but    it has plenty of functionality. It can be found live    [here](https://twitter-clone-6ebd5.web.app/home). I was also learning    the basics of Firebase while building this app, so my database    structure leaves a lot to be desired, which didn't help with coding.

## Features

 - Mobile, tablet and desktop compatible
 - Create account, login and logout
 - Initial account setup (profile, header images, bio and location) and as many profile edits as needed
 - Post tweets which can include pictures, trends and user mentions that act as hyperlinks to trend search or user account
 - Like, bookmark or reply to tweet
 - Delete your own tweets
 - Follow accounts
 - View followers, followed accounts or bookmarked tweets
 - Search for tweets or users
 - View trending items and account recommendations

## How to use/test
Go to the [app link](https://twitter-clone-6ebd5.web.app/home). If you want to interact with the app beyond just reading posts, you need to create an account. Clicking on most things while not logged in will take you to the log in page which has a link to the sign up page. I recommend using a temporary email address (for example check [this website](https://temp-mail.org/en/)) so that I can not see your real email address and bug you with emails asking for your opinion. (as I can see all created accounts in Firebase Authentication). **!!!SIGN UP HAS  A BUG WHERE YOU WILL NOT BE AUTOMATICALLY REDIRECTED TO THE HOME PAGE. CLICKING THE X ON THE SIGN UP PAGE AFTER CLICKING SIGN UP WILL TAKE YOU THERE AND YOU SHOULD BE LOGGED IN. THE TEMPORARY EMAIL WILL NOT BE NEEDED AFTER THIS STEP, AS VERIFYING YOUR EMAIL IS NOT NECESSARY!!!**

## ToDo

 - [ ] improve database structure
 - [ ] clean css
 - [ ] add loading animations
 - [ ] fix loading order on certain pages
 - [ ] plenty of stuff (typescript, styled components, redux,....)

## Known Bugs

 - sign up page redirect to home does not work properly
 - deleting a reply will not update the replies count on the parent

