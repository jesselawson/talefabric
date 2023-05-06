# Talefabric: an interactive d20-based storytelling engine prototype

Talefabric is a very rough prototype of an interactive CYOA-esque storytelling 
game engine with a d20 system. 

Here's a preview of what's possible right now:

![Preview](assets/prototype-demo.gif)

**Note: This is currently a PROTOTYPE.**

- A **save** feature needs to be implemented (good thing the game's state—including 
all player choices—are stored in one big object)
- Originally I wanted to have this build a site into a mobile app with Cordova; 
  it's not desiged for desktop, but that doesn't mean it doesn't work or look 
  okay on desktop.

Some features available right now include:

- Everything is defined in a a single file `gamedata.ts` according to 
  a set of strongly-typed objects.
- Conditional branching is possible, limited only by your patience and ability 
  to manage tedium
- D20 is the only dice available right now; you can display choices based on 
  past rolls, content based on rolls, etc.

# Quickstart

_I'm, using Yarn but npm should work just fine._

1. Clone the repo.
2. `cd` into the directory where this repo is, then run `yarn` to install 
   all dependencies (hint: there aren't very many).
3. Start the dev server with `yarn start`.

**To edit the story**:
- The story contents are all defined in `gamedata.ts`. 

**To edit the engine**:
- Types are all mostly documented; they live in `core/datamodels.ts`.
- How do things work? Check out `core/engine.ts`. 

**To build your story**:

Here's the exact command I use to build the `docs` folder in this repo, which is, 
for our purposes, a compiled demo:

```
yarn parcel build index.html --public-url ./ --out-dir docs
```


# Original vision

I was originally inspired by Liza Daly's [Windrift](https://github.com/lizadaly/windrift) 
to build a text-based system for telling the stories I want to tell. The result 
was [Campfire](https://github.com/jesselawson/campfire), a simple markdown-esque 
language interpreter that provided Hypercard-esque links between different 
passages. Eventually I decided that a highly-opinionated web app would make 
the most sense given how I want the player to experience the game—and thus, 
Talefabric was born.

# Architecture

Everything exists as part of a big `GameData` object. That holds the current 
state of the game, including player choices, as well as all potential states of 
the game.

Players are presented with `Situation`s. A Situation is comprised of `Block`s and 
`PlayerOption`s. A Block is a kind of text or image that is presented to the player. 
A PlayerOption is either a _link option_—some text that sends the player to 
another Situation—or a _roll option_—some text that causes a d20 to roll. 

Blocks can be conditionally rendered or contain conditionally rendered content. 
Similarly, PlayerOptions can be conditionally presented to the player. For example, 
if you only wanted the player to make a perception check if they have special 
goggles in their inventory, you could conditionally present the roll option 
based on whether that item exists in their inventory. 

I _highly suggest_ you read through the `datamodels.ts` file, which documents 
each of the types used in the engine and to define the demo preview in `gamedata.ts`. 
Most of what you will need to learn to write your own game can be 
reverse-engineered from `gamedata.ts`. If you run into issues, you can reach 
out on [Mastodon](https://tech.lgbt/@jesse) and I'll try to help!

## Where to begin

Everything you'll define about your game is in `gamedata.ts`. There you'll see 
a variable named `gameData` defined like this:

```js
export var gameData:GameData = {
  // ...
```

Define your game and write your content by adding it to the `gameData` object.

## The starting situation

Situations are defined in the `situations` property of `gameData`. 

Every game must have at least one situation with `start` as the `id`:

```ts
situations: [
    {
      id: "start",
      contentBlocks: [
        {
          text: ()=> 
            `Hello world!`
        },
    }
]
```

## Displaying content

There are three kinds of content to display:
- Text, which is (you guessed it) plain text. 
- Images, which are images from the `assets` folder
- Dialogue, which are when characters are speaking

Define blocks of content as elements in the `contentBlocks` property of each 
situation you define. 

### Displaying text

```js
situations: [
    {
      id: "some_id", // this must be "start" if this is first first situation
      contentBlocks: [
        {
          text: ()=> 
            `The fire is warm and the smell of cold pine and frost pours \
             through one of the open windows of the Horse & Halberd, one \
             of the dozen taverns in the kingdom of Fallenrock.`
        },
        // ...
```

### Displaying images

```js
situations: [
    {
      id: "some_id", // this must be "start" if this is first first situation
      contentBlocks: [
        {
          format: BlockFormat.image,
          image: "assets/images/horse-and-halberd.png"
        },
        // ...
```

### Displaying dialogue

Before you can display dialogue, you need to have defined a character. Defining 
a character associates a character portrait to a name. 

#### Defining characters

In the demo, you'll see a character named Oberyn Firewalker. Oberyn is defined 
in the `gamedata.ts` file as an item in the `characters` property of the main 
`GameData` object: 

```js
characters: [
    {
      id: "oberyn",
      name: "Oberyn Firewalker",
      portrait: "assets/portraits/oberyn.png"
    }
  ],
```

#### Making characters speak

After you define a character, their `id` can be used in a content block 
to turn that block into a dialogue block (by setting the format to `BlockFormat.dialogue`):

```js
situations: [
  {
    id: "some_situation_id",
    contentBlocks: [
      {
          format: BlockFormat.dialogue,
          characterId: "oberyn",
          text: () => `Greetings, traveler. I am Oberyn. I sense you're here to begin your magic training. Are you here to study as a druid or as a sorcerer?`
      },
  // ...
```

## Providing options

Player options are defined in the `playerOptions` property of a `situation`. After 
displaying all `contentBlocks`, a situation will then have its `playerOptions` 
presented to the player. 

Player options come in two forms: link options and roll options. 

### Defining a Link option

A link option, when selected, will simply move the player to another situation. 

At a minimum, a link option must contain:
- `id`, the unique ID of this option
- `text`, the text to display for this option
- `onPass()`, the callback function invoked if this option is selected

Here's an example: 

```js
{
  id: "start_druid",
  text: () => "a druid",
  
  onPass: (gameData) =>{
    e.setVariable(gameData, 'player_class', 'druid');
    e.setDCModifier(gameData, "crowsense", "perception", 1);
    e.goToScenario(gameData, "is_druid");
  }
},
```

### Defining a Roll option

A roll option, when selected, will roll a D20 on the screen. The result will 
be emitted, and then depending on how the option was defined, either the provided 
`onPass` or `onFail` callback function will be invoked. 

At a minimum, a roll option must contain:
- `id`, the unique ID of this option
- `text`, the text to display for this option
- `dcAttribute`, which player attribute this will use
- `dc`, the DC for this roll
- `onPass()`, the callback function invoked if the DC is successful
- `onFail()`, the callback function invoked if the DC is NOT successful

Here's an example:

```js
{
  id: "start_charisma",
  text: () => "Take in your surroundings... Does something seem off?",
  dcAttribute: "perception",
  dc: 12,
  dontClear: true,
  onPass: (gameData) =>{
    e.writeText("This looks like a place that's safe to be at. For now. There's definitely a subtle feeling of alertness among the few people inside, but everyone seems to be minding their own business.")
  },
  onFail: (gameData) =>{
    // If I wanted to, I could specifically check for:
    // if(gameData.lastd20Roll == 1) or something like that.
    e.writeText("Everything about this place seems great!")
  }
},
```

## Defining attributes

You can set attributes that can then be used to modify DC rolls. 

In the demo, you can see that when a player chooses the option to be a druid, 
we set their perception to +1:

```js
{
  id: "start_druid",
  text: () => "a druid",
  
  onPass: (gameData) =>{
    e.setVariable(gameData, 'player_class', 'druid');
    
    // ---------- RIGHT HERE --------
    e.setDCModifier(gameData, "crowsense", "perception", 1);
    // ------------------------------
    
    e.goToScenario(gameData, "is_druid");
  }
},
```

In the above example, we give the player "crowsense", which causes a +1 to 
perception checks. Now whenever a player option is defined and the `dcAttribute` 
is set to `"perception"`, the player will have a +1 to the roll automatically 
calculated and included. Additionally, the output of the roll will include 
the value of the modifiers, enumerated in the order in which they were given to 
the player. 

## How the `gamedata` system works

### `dontClear: true` explained

There's a engine-only setting in Blocks called `alreadySelected`. This is set to true once the item is selected. In cases where the option's `onPass()` does not contain a `goToSituation()` call, `alreadySelected` being true will inform the renderer to ignore this option during the next rendering of the player's options. In other words, this helps the renderer know which options to re-draw and which ones to not redraw. 

### How dice work

Any option can be a dice option by defining a `dc` (difficulty class). 
When `dc` is defined, the following must also be defined:
- `onPass()`, in the event the roll passes the DC
- `onFail()`, in the event the roll fails the DC
- Optionally, you may define `hideDCResult`, which will resolve the 
  roll but it wont tell the player whether they passed or failed the DC.

### Content blocks

#### Narrator Text

You can use HTML in your text, but wrap it all in a `<span>`. 

#### Using custom CSS classes

_A future feature to include a `with_css` to content blocks would be great! 
Until then, there's not a great way to use custom CSS with a content block 
without defining a custom block type yourself, and then editing the engine 
to accomodate.

# Contributing

Contributions are welcome and encouraged. Fork the repo, then create a PR. 

# Help/questions/support

- File an issue here in GitHub
- Reach out on [Mastodon](https://tech.lgbt/@jesse)

# License

```
MIT License

Copyright (c) 2023 Jesse Lawson.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```