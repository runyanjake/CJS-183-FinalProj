# Text Time 
#### Cassia Artanegara, Jake Runyan, and Shane Kennerly's Final Project </br> Professor Luca de Alfaro's CMPS 183 Web Applications </br> University of California, Santa Cruz.
##### [(PLAY THE FINAL VERSION)](https://jmrunyan.pythonanywhere.com/texttime "Final Version") [(PLAY THE BETA)](https://jmrunyan.pythonanywhere.com/texttime_beta "Beta") [(PLAY THE ALPHA)](https://jmrunyan.pythonanywhere.com/texttime_alpha "Alpha") [(PLAY THE PROTOTYPE)](https://jmrunyan.pythonanywhere.com/texttime_prototype "Prototype")

----------------------------------------------------------------------------

##### What is this project about?

> `This project generates a website that hosts small group sessions of turn-based textual games.`
> * Upon entering normally, users see a list of global games in play that are not currently filled with players, and have the option to join the game and wait in a queue for their turn. </br>
> * Players that idle on their turns are timed out from the game or skipped. Players that leave are removed from the play queue. Games with no users time out after a given period and are removed. </br>
> * Creating an account allows users to save game states and create and personalize a profile. Aesthetic changes such as website look and feel preferences are saved to a user's account. </br>
> * User customization options will be available. This is limited to defining primary, secondary, and auxiliary color themes that style the website accordingly. </br>
> * Analytics for the site will be collected and tabulated for viewing on the (public and?) admin console(s?).
> * An option for users to watch an ad to support the developers and server costs will be available when the user is waiting for their turn.
> * There are a number of games that users can choose to play: </br>
>   * Tall Tales </br>
>     * A user is given an initial sentence to begin the story. Then, the next user is given the previous user's sentence
        and is supposed to add another sentence to continue the story, based on the previous sentence. This will go around
        in a cycle, with each user only able to see the sentence the previous user contributed. When it gets back to the 
        original user, they have the option to either end the game and have everyone view the generated story, or to go around
        in another cycle, continuing to add to the story. </br>
>   * Taboo </br>
>     * One user adopts the "guesser" role, while other users act as "helpers". Helpers are given a target word that they are tasked with hinting the guesser to say, but also a blacklist of words that they cannot use to do so. Helpers take turns offering an English sentence that should help the user guess the target word. This game can be played in a timed or freeplay mode. Points are awarded to the helper that gave the most recent hint. </br>
>   * Typeracer </br>
>     * All players are given a sentence that they have to type out. Sentences are pulled from the pool of sentences submitted in other game modes. Maybe store top 10,000 rated entries. Voting can be applied to each sentence after it is finished to punish bad english sentences from making it into this game mode.

##### How do I use this project?

> This project uses Massimo Di Pierro's Web2py framework [(SEE IT HERE)](http://www.web2py.com "Click me!"). </br>
> It is intended to be added as an application to the Web2Py framework. </br>
> To use, please download the [source distribution](http://www.web2py.com/examples/static/web2py_src.zip "Click to download.") of Web2py and clone this repository in `web2py/applications`:
```
cd web2py/applications 
git clone https://github.com/runyanjake/CJS-183-FinalProj NameOfWebsite 
```
> Then, it can be served by Web2py and viewed from a browser window: </br>
```
cd web2py/ 
python web2py.py 
```
> Follow the Web2py steps to serve the webpage and visit it in a browser. </br>

##### Contributor Etiquette
> For this project, we used a simple git etiquette. Pull requests were not used for simplicity and because the team worked physically together. For this project, we used a `commit` -> `pull` -> `push` workflow to track our changes, described simply below: </br>
Before local editing: 
```
git pull
``` 
> Editing Workflow:
```
git commit -am "foo bar baz"
git pull
git push origin <branchname/master>
```
> Auxiliary Commands:
```
git branch <branchname> (creation)
git branch -d <branchname> (deletion)
git merge <otherbranch> (writes changes in otherbranch on top of current branch)
^ if working from a local branch, merge master on top of it, and then switch to master
  and merge the local branch on top of master. Now, master is up to date with all changes
  made on the local branch.
git status (status)
```

##### Contributions and Responsibilities
> Cassia did x. </br>
> Jake did y. </br>
> Shane did abs(exp(z^x%p)). </br>

##### Historical Evidence: Beta Testing Round II
> Special thanks to beta testers Bryan, Julian, and Albert (not pictured).
![alt text][logo]

[logo]: https://github.com/runyanjake/CJS-183-FinalProj/blob/master/betaii.JPG "Logo Title Text 2"

----------------------------------------------------------------------------

### Contact the Authors
|Name        |Email            |Status                  |
|------------|------------------|----------------------:|
|Cassia Artanegara|*cassia@ucsc.edu*  |3rd Year CS/Art | 
|Jacob Runyan     |*jmrunyan@ucsc.edu*  |3rd Year CS     |
|Shane Kennerly   |*skennerl@ucsc.edu*  |3rd Year CS/Math|

