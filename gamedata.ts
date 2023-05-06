import {BlockFormat, GameData} from './core/datamodels';
import * as e from './core/engine';

export var gameData:GameData = {
  title: 'Welcome to the Talefabric demo',
  description: 'An introduction to the Talefabric interactive storytelling language.',
  currentSituation: "start",
  lastD20Roll: 1,
  modifiers: [],
  vars: [],
  
  characters: [
    {
      id: "oberyn",
      name: "Oberyn Firewalker",
      portrait: "assets/portraits/oberyn.png"
    }
  ],

  situations: [
    {
      id: "start",
      contentBlocks: [
        {
          headingText: ()=> `Chapter One`
        },
        {
          format: BlockFormat.image,
          image: "assets/images/horse-and-halberd.png"
        },
        {
          text: ()=> 
            `The fire is warm and the smell of cold pine and frost pours \
             through one of the open windows of the Horse & Halberd, one \
             of the dozen taverns in the kingdom of Fallenrock.`
        },
        {
          text: () => 
          `Fall has brought with it two things. The first is frigid chill each night as the wind crawls out of the mountain passes that lead out to the outer kingdoms.`
        },
        {
          text: () => 
          `The second is representatives from the Court of Labor. As is predictable, they're here just as the temperatures have dropped to remind those who can't afford good housing or a meal for their children that they can always exchange a season's worth of rations for a year of their lives in the Soul Mines.`
        },
        {
          text: () => `You're not here for a job, though. Not necessarily. You're here because it's been 260 lunar cycles since your birth, which means you are now at the age where you can begin studying one of the two dominant forms of magic in this realm: eon magic and sol magic.`
        },
        {
          text: () => `<span><b>Eon magic</b> comes from the <i>energy of nature</i>, and is practiced by Druids.</span>`
        },
        {
          format: BlockFormat.image,
          image: "assets/images/eon-magic.png",
        },
        {
          format: BlockFormat.help,
          text: () => `<h6>The Druid Class</h6>
          <p>As a Druid, your relationship to magic is one of spiritual connection. You believe that magic is something channeled through you, and  that mystical or even somewhat divine forces can move through you via your actions and words.</p>
          <p>Druids are the only class that uses <i><b>Eon</b></i>, or <i>energy of nature</i>, magic. Eon magic includes root and vine spells, animal control spells, spirit summoning spells, and shapeshifting spells.<br/><br/>
          Primary attributes:<br/>◐ <strong>strength</strong><br/>◑ <strong>\
        wisdom</strong>`
        },
        {
          text: () => `<span><b>Sol magic</b> comes from the <i>spirit of life</i>, and is practiced by Sorcerers.</p></span>`
        },
        {
          format: BlockFormat.image,
          image: "assets/images/sol-magic.png",
        },
        {
          format: BlockFormat.help,
          text: () => `<h6>The Sorcerer Class</h6>
          <p>As a Sorcerer, you are an expert craftsperson of magical machinations and potions. The spirit of life that runs through all things is harnessed through special machinery that you spend years studying and using.</p>
          <p>Sorcerers are the only class that uses <i><b>Sol</b></i>, or <i>source of life</i>, magic. Sol magic includes healing spells, projectile spells, and explosive spells.<br/><br/>
          Primary attributes:<br/>◐ <strong>dexterity</strong><br/>◑ <strong>
          intelligence</strong>`
        },
        {
          text: () => `As you enter the tavern, a slender man with long white and green hair turns, his cloak draped over and around a huge St. Bernard that's tucked up beside him. He's standing by a counter and sipping something hot from a brushed metal cup. He looks right at you.`
        },
        {
          format: BlockFormat.dialogue,
          characterId: "oberyn",
          text: () => `Greetings, traveler. I am Oberyn. I sense you're here to begin your magic training. Are you here to study as a druid or as a sorcerer?`
        },
      ], 
      playerOptions: [
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
        {
          id: "start_druid",
          text: () => "a druid",
          
          onPass: (gameData) =>{
            e.setVariable(gameData, 'player_class', 'druid');
            e.setDCModifier(gameData, "crowsense", "perception", 1);
            e.goToScenario(gameData, "is_druid");
          }
        },
        {
          id: "start_sorcerer",
          text: () => "a sorcerer",
          
          onPass(gameData) {
            
          },
        }
      ]
    },
    {
      id: "is_druid",
      contentBlocks: [
        {
          text:() => `He looks you up and down, then nods.`
        },
        {
          format: BlockFormat.dialogue,
          characterId: "oberyn",
          text: () => `The path to mastering eon magic is a long and rewarding one. Patience is key.`
        },
        {
          text: () => `He reaches into his cloak and pulls out a blank piece of paper.`
        },
        {
          format: BlockFormat.dialogue,
          characterId: "oberyn",
          text: () => `The Moonreader asked that I give this to you.`
        },
        {
          text: () => `He hands the paper to you, and as your fingers touch it, handwritten letters begin to appear as if dissolved in reverse.`
        },
        {
          handwriting: () => `<p>Young druid,</p>
          <p>It has been two hundred and sixty full moons since your birth, so now I, the Moonreader of the Order of Eon, do call upon you to render service as a Mage.</p>
          
          <p>Mages provide spiritual counsel to courts and leaders everywhere, serving those around us to keep the energy of nature in balance. When druidic energy is present in high courts, better decisions are made and nature gravitates toward harmony. Where there is no druidic energy -- or worse, where there is corrupt magic -- even great heroes can plunge themselves and the souls of their people into chaos.</p>
          
          <p>Your first assignment is to accompany Oberyn to Pentoth. Oberyn is a friend of the Order of Eon, and while you provide counsel to the people of this realm, he will provide counsel to you. Heed his words, as the lands beyond the gates of Fallenrock are not what they used to be.</p>
          
          <p><i>Calliah</i></p>
          `
        },
        {
          text: () => `After you finish reading the letter, it turns to ash, then drifts away piece by piece until it's gone.`
        },
        {
          format: BlockFormat.dialogue, 
          characterId: "oberyn",
          text: () => `Don't worry: I already read it.`
        },
        {
          text: () => `He gestures into the tavern.`
        },
        {
          format: BlockFormat.dialogue, 
          characterId: "oberyn",
          text: () => `Shall we begin?`
        },
      ],
      playerOptions: [
        {
          id: `oberyn_how_long`,
          text: () => `"How do you know the Moonreader?"`,
          dontClear: true,
          onPass(gameData) {
            e.writeDialogue(gameData, "oberyn", "I owe a great debt to the Moonreader. She and the rest of the Coven of the Crow have offered me a second chance at life, and through life, redemption.");
            e.remember(gameData, "oberyn_how_long");
          },
        },
        {
          id: `oberyn_about_the_coven`,
          text: () => `"Tell me about the Coven of the Crow."`,
          renderCondition(gameData) {
            return e.recall(gameData,"oberyn_how_long");
          },
          dontClear: true,
          onPass(gameData) {
            e.writeDialogue(gameData, "oberyn", "The Coven of the Crow is the last surviving druidic coven, led by the Moonreader herself. She is who brought you here today. I am sure of it.")
            e.delayFn(233, function() {
              e.writeDialogue(gameData, "oberyn", "It used to be that there were many covens wherever you went. Witches and their covenkeepers could be found as far north as the outer kingdoms and as far south as the ice deserts. Over the last three-hundred years, though, a series of mysterious deaths led to the rise of tyrrant kings all set on destroying centuries of peace for centimeters of land that was stolen from the first druids.");
            });
            e.remember(gameData, "oberyn_about_the_coven");
          },
        },
        {
          id: `oberyn_exposition`,
          text: () => `"That's a lot of exposition to just dump on me on my first day."`,
          renderCondition(gameData) {
            return e.recall(gameData,"oberyn_about_the_coven");
          },
          dontClear: true,
          onPass(gameData) {
            e.writeDialogue(gameData, "oberyn", "Yes, well, our complicated world has complicated stories, doesn't it?")
            
            e.remember(gameData, "oberyn_exposition");
          },
        },
        {
          id: `oberyn_can_i_trust_you`,
          dontClear: true,
          text: () => `"How did the Moonreader know I would be here?"`,
          onPass(gameData) {
            if(e.recall(gameData, "oberyn_exposition")) {
              e.writeDialogue(gameData, "oberyn", "Your desire for answers will serve you well, but right now, you're asking too many questions.")
            }

            e.writeDialogue(gameData, "oberyn", "When the Moonreader is chosen by the crows, they become conduits for the eon magic that lives in all creatures. She knows where you are because you know where you are; you are a creature and eon magic flows through your veins.")
          },
        },
        {
          id: `oberyn_get_started`,
          dontClear: true,
          text: () => `"How do I start?"`,
          onPass(gameData) {
            e.writeDialogue(gameData, "oberyn", "")
            e.remember(gameData, "oberyn_get_started")
            //e.goToScenario(gameData, "")
          },
        },
        {
          id: `oberyn_lets_go`,
          text: () => `"Okay, I'm ready to go now."`,
          renderCondition(gameData) {
            return e.recall(gameData, "oberyn_get_started")
          },
          onPass(gameData) {
            //e.goToScenario(gameData, "")
          },
        },
        {
          id: `oberyn_explore_tavern`,
          text: () => `"I'd like to check out the tavern a bit more first."`,
          renderCondition(gameData) {
            return e.recall(gameData, "oberyn_get_started")
          },
          onPass(gameData) {
            //e.goToScenario(gameData, "")
          },
        }
      ]
    }
  ], 
  
}