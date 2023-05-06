
import { gameData } from "../gamedata";
import { BlockFormat, DCModifier, GameData, Situation } from "./datamodels";

// I needed a way to keep track of the height of the screen because I wanted the 
// new elements that are created to gracefully glide onto the screen -- not appear
// all jagged and clunky like they were doing. This is a poor way to implement 
// this but the Twitter layoffs are awful to watch in real-time. I feel so bad 
// for those families and hope everyone finds a good job. 
var __height = 1000;

//* Returns a pointer to the current situation in gameData
function currentSituation(gameData:GameData):Situation|undefined {
  for(let a=0;a<gameData.situations.length; a++) {
    console.log(`Checking '${gameData.situations[a].id}'=='${gameData.currentSituation}'`)
    if (String(gameData.situations[a].id) == String(gameData.currentSituation)) {
      return gameData.situations[a];
    }
  }
  return undefined;
}

/**
 * Returns the total DC modifier for the specified attribute.
 * @param gameData 
 * @param attribute The attribute (e.g., `perception`) to sum modifiers for
 */
export function getAttributeModifiers(gameData:GameData, attribute:string):number {
  let result = 0;
  gameData.modifiers.filter( m => m.attribute == attribute).forEach( x => result += x.value );
  return result;
}

/**
 * Writes the player options for the current scene 
 * to the main container.
 * @param gameData The gameData instance.
 */
export function writePlayerOptions(gameData:GameData) {
  let form = document.createElement('div')
  form.id = 'player-options';
  form.classList.remove('list-leave-active');
  form.classList.add('playerOptionsContainer', 'list-enter-active','open', 'row', 'g-1');

  // Iterate over the current situation's options and create 
  // a form field for it
  currentSituation(gameData)?.playerOptions.filter(o => o.alreadySelected == undefined).forEach( option => {
    if(option.renderCondition !== undefined) {
      console.log(`Render condition found for '${option.id}' and it's '${option.renderCondition(gameData)}'`)
      if(!option.renderCondition(gameData)) {
        return
      }
    } 

    let maybeShowAttribute = () => {
      if(option.dcAttribute == undefined) {
        return ""
      }
      
      let html = option.dcAttribute !== undefined ? '<span class="option-dc-attribute">'+option.dcAttribute +' (': '';
      let modifier = getAttributeModifiers(gameData, option.dcAttribute);
      html += modifier < 0 ? "-" : "+";
      html += `${(modifier)})</span>`;
      return html
    }
    
    let inputField = `
      <span>
      <input class="form-check-input" type="radio" id="${option.id}" name="player_choice" value="${option.id}"/>
      ${maybeShowAttribute()}
      ${option.text()}
      </span>
    `;
      let node = document.createElement('label')
      node.htmlFor = option.id.toString();
      
      node.innerHTML = inputField
      form.appendChild(node)
      
  })

  let e = document.createElement('input');
  e.id = "player-confirm-button";
  e.classList.add('button', 'starts-invisible');
  e.name = "submit";
  e.type = "submit";
  e.value = "confirm";
  
  // Here we handle the actual click:
  e.addEventListener('click', function() {
    handlePlayerConfirm(gameData)
  });
  
  form.appendChild(e)
  appendToMainContainer(form)

  // Fix: Avoid choppy blocks 
  document.getElementById("container")!.style.minHeight = document.getElementById("container")!.style.minHeight + 500;

  
}

/**
 * Appends an HTML element via appendChild() to the main play container
 * @param any An HTMLElement
 */
export function appendToMainContainer(any) {
  document.getElementById('container')?.appendChild(any)
}

function writePlayerOptionHistory(e:string) {
  writeCSSText(e, ['list-enter-active','player-option-history', 'highlight']);
}

/**
 * Spins the dice to `num`, starting on the number that 
 * @param num The result the dice should land on
 */
function spinDiceToResult(num:number) {
  let die = document.getElementById('die'),
    sides = 20,
    initialSide = 4,
    lastFace,
    timeoutId,
    transitionDuration = 1000, 
    animationDuration  = 1000

  
    clearTimeout(timeoutId)
    die.setAttribute('data-face', num.toString());
    
    
    //$('ul > li > a').removeClass('active')
    //$('[href=' + face + ']').addClass('active')
    
    
}

function randomInt(min, max) {
  const range = max - min + 1
  const bytes_needed = Math.ceil(Math.log2(range) / 8)
  const cutoff = Math.floor((256 ** bytes_needed) / range) * range
  const bytes = new Uint8Array(bytes_needed)
  let value
  do {
      crypto.getRandomValues(bytes)
      value = bytes.reduce((acc, x, n) => acc + x * 256 ** n, 0)
  } while (value >= cutoff)
  return min + value % range
}


export function handlePlayerConfirm(g:GameData) {
  // Get the value
  // Find appropriate callback function
  // Fade out input box while fading in option history
  var ele = <HTMLInputElement>document.querySelector('input[name="player_choice"]:checked');
  
  // Find the right link to handle:
  currentSituation(g)?.playerOptions.forEach( option => {
    if(<string>option.id == <string>ele.value) {

      // If we're not supposed to clear this one, mark it 
      // so that we don't!
      if(option.dontClear !== undefined) {
        if(option.dontClear == true) {
          //ele.classList.add('list-enter-active')
          option.alreadySelected = true
        }
      }

      // @mark Until the web editor done, this is where I'm 
      //        handling the different types -- if dc exists, then 
      //        this option is treated as a DiceOption.
      //        There are two options: Dice Option, and Option. 

      if(option.dc !== undefined) {
        // @todo handle dc check

        // 1. Disable player options so they fade out, fading in the player's 
        //    choice. 
        disablePlayerOptionsContainer(<string>option.text());

        // 2. Get random d20 roll, and figure out which number to start the 
        //    dice on for maximum spinification.
        let result = Math.round(randomInt(1,20))
        
        // 3. Fade in dice element, spinning dice, then drop the dice and fade 
        //    in the remaining stuff. It might be a little different; the FEEL 
        //    is what's important here, so be mindful of the timeout values.
        window.setTimeout(function() {
          let container = document.getElementById('dicebox-container');
          container.classList.toggle('open');
        
          spinDiceToResult(result); // Takes 1s

          window.setTimeout(function() {
            // Write the result

            // @todo (@leftoff) Figure out how to get the right data here.
            // I think I need to add the attribute type for the d20 roll 
            // to the playeroption object as a configurable string:
            // e.g., [ perception, attack, athletics, wisdom save, dexterity saving throw]
            writeD20Result(g, 
              option.dcAttribute,
              result,
              g.modifiers.filter( m => m.attribute == option.dcAttribute)
            );

            if(result >= option.dc) {
              window.setTimeout(function() {
                option.onPass(g)
              }, 233);
            } else {
              window.setTimeout(function() {
                option.onFail(g)
              }, 233);
            }

            if(option.dontClear !== undefined) {
              if(option.dontClear) {
                // Resume the game
                window.setTimeout(function() {
                  keepPlaying(g);
                }, 233*2);
              }
            }
            
            
            container.classList.toggle('open');
          }, 1500)

          

        }, 1000);
        


        // 4. Based on result / dc check, transition color to either:
        //    - Green, for success
        //    - Red, for fail
        //    - Purple, for mysterious


        
        
        
        
      } else { // end check if this is option has dc or not (which would mean it's a dc check option)
        // Hey it's not a dc check
      
        //clearPlayerOptionsContainer();
        disablePlayerOptionsContainer(<string>option.text());

        let delay = 2; // If we set to 1, we will fade in at the same time as the player's choice container
        //delay++;
        //delay++;
        window.setTimeout(function() {
          option.onPass(g)
        }, 233*delay)
        
        delay++;

        if(option.dontClear !== undefined) {
          if(option.dontClear) {
            // Resume the game
            window.setTimeout(function() {
              keepPlaying(g);
            }, 233*delay);
          }
        }
        
      }
    }
  })
}

export function writeHeading(msg) {
  // @todo Add to state manager (the play log)
  let h1 = document.createElement('h1');
  h1.classList.add('mt-5');
  h1.innerText = msg;
  appendToMainContainer(h1)
}

export function writeLead(msg) {
  // @todo Add to state manager (the play log)
  let p = document.createElement('p');
  p.classList.add('lead');
  p.innerText = msg;
  appendToMainContainer(p)
}

export function writeText(msg) {
  writeCSSText(msg, ['list-enter-active', 'row', 'g-1']);
}

/**
 * Writes a dialogue block to the screen.
 * @param id The characterId of the speaker
 * @param msg The message
 */
export function writeDialogue(gameData:GameData, id:string,msg:string) {
  let speaker = gameData.characters.find(e=>e.id == id);
  let html = `
  <div class="dialogue-box">
    <div class="col-3">
      <img class="portrait" src="${speaker?.portrait}"/>
    </div>
    <div class="col-9">
      <div class="dialogue-speaker-name">${speaker?.name}</div>
      <div class="dialogue-speaker-text">
        ${msg}
      </div>
    </div>
  </div>`;
  let d = document.createElement('div')
  d.innerHTML = html;
  d.classList.add('list-enter-active', 'row', 'g-1')
  appendToMainContainer(d)
}

/**
 * Writes a d20 result box to the screen
 * @param id The characterId of the speaker
 * @param msg The message
 */
 export function writeD20Result(gameData:GameData, attribute: String, value:number,modifiers: DCModifier[]) {
  
  let html = `
  <table class="d20-result-container">
    <tr>
      <td class="attribute-name"><span >${attribute.toUpperCase()}</span><br/>
      <span class="composition-label">rolled </span><span class="composition-value">${value}</span>`;
  
  if(modifiers.find( m => m.attribute == attribute)) {
    html += `<br>`
  }
  
  modifiers.forEach(modifier => {
    let row = `<span class="composition-label">${modifier.label} </span><span class="composition-value">${modifier.value}</span><br>`;
    html += row;
  });
        
  // Add up all the modifiers to calc the total
  let total = value;
  modifiers.forEach( m => total += m.value);
  html += `</td>
      <td class="attribute-value"><span>${total}</span></td>
    </tr>
  </table>
`;
  let d = document.createElement('div')
  d.innerHTML = html;
  d.classList.add('list-enter-active', 'd20-result-container-container'); // ""You miss 100% of the shots you don't take." -Wayne Gretzky" -Michael Scott
  appendToMainContainer(d)
}

/**
 * Writes a full-width image as a block.
 * @param img Path to image. Will be width 100%.
 */
export function writeImage(img:string) {
  let html = `<img class="full-width block-image" src="${img}"/>`;
  let d = document.createElement('div')
  d.innerHTML = html;
  d.classList.add('row', 'g-0'); // Images are g-0 bc they go flush with edges of screen
  appendToMainContainer(d)
}

export function writeCSSText(msg,cssClasses:string[]=[]) {
  // @todo Add to state manager (the play log)
  let p = document.createElement('p');
  cssClasses.forEach(cls => {
    p.classList.add(cls);
  });
  p.innerHTML = msg;
  appendToMainContainer(p)
}

export function clearScreen() {
  let c = document.getElementById('container');
  let children = c?.children || {length:0};
  if(children.length > 0) {
    for(var i=0;i<children.length; i++) {
      let child = children[i];
      child.classList.remove('list-enter-active')
      child.classList.add('list-leave-active')
    }
  }
}

/**
 * Wipes up the player options container, changes its text, then 
 * re-wipes open the container for a fluid log of what the player chose. 
 */
function disablePlayerOptionsContainer(newButtonVal:string) {
  let p = document.querySelector('#player-options')
  let labels = p?.querySelectorAll(":scope > label");

  labels?.forEach(label => {
    label.classList.add('list-leave-active');
  });

  let button = document.querySelector('#player-confirm-button') as HTMLButtonElement;

  button.disabled = true;
  button.classList.add('list-leave-active');

  //slideToggle(p); // .3s

  window.setTimeout(function() {
    p.innerHTML = `<p class="player-option-history open list-enter-active row g-1">${newButtonVal}</p>`
    p!.id = '';
  },233);
  
  button.id = '';
}

export function goToScenario(gameData:GameData, scenarioId:string) {
  //console.log(`Going from '${gameData.currentSituation}' to '${scenarioId}'`)
  gameData.currentSituation = scenarioId;

  // For good measure, let's just check if that scenario even exists:
  let found:Boolean = false;
  console.log(gameData.situations)
  for(let x=0;x<gameData.situations.length;x++) {
    //console.log(`--> Checking '${gameData.situations[x].id}'...`)
    if(gameData.situations[x].id == scenarioId) {
      found = true;
      break
    }
  }

  if(!found) throw new Error(`Situation '${scenarioId}' not found!`)


  //clearScreen();
  renderCurrentSituation(gameData);
}

const symbols = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘']

function randomSymbol() {
  let result = Math.floor(Math.random() * 7 + 1)

  return symbols[result]
}

function getPortraitUrlFromId(g:GameData,id:string) {
  g.characters.forEach( char => {
    if(char.id == id) {
      return char.portrait;
    }
  })
}

/// Used to re-render the player options after a non-gotosituation onpass:
export function delayFn(delay:number,callback:Function) {
  window.setTimeout(callback, delay);
  
}

export function keepPlaying(g:GameData) {
  delayFn(500, function() {
    writePlayerOptions(g);
  });
}

function renderCurrentSituation(gameData:GameData) {

  // We store the scroll height globally because we're masochists
  let minHeight = __height + 900;
  let newMinHeight = `${minHeight}px`

  document.getElementById("container").style.minHeight = newMinHeight;
  //console.log(`Situation: ${currentSituation(gameData)?.id}`)
  
  // Delay fading these in
  let delay = 0;
  let speed = 233;
  let noMoreDelay = false;
  
  currentSituation(gameData)?.contentBlocks.forEach( block => {
    
    // If a render condition was not provided, assume true
    if(block.renderCondition !== undefined) {
      if(!block.renderCondition(gameData)) {
        return
      }
    } else { 
      
      delay > 4 ? noMoreDelay = true : {}

      // Is this a specially formatted block?
      if(block.format !== undefined){

        // Is this a dialogue block?
        if(block.format == BlockFormat.dialogue 
          && block.characterId !== undefined 
          && block.text !== undefined
          ) {
          window.setTimeout(function() {
            writeDialogue(gameData, block.characterId, block.text())
          },delay*speed)
          noMoreDelay == false ? delay++ : {}
        
        // Is this a image block?
        } else if(block.format == BlockFormat.image
          && block.image !== undefined 
          ) {
          window.setTimeout(function() {
            writeImage(block.image)
          },delay*speed);
          noMoreDelay == false ? delay++ : {}
        
        // Is this an OOC block?
        } else if(block.format == BlockFormat.help) {
          window.setTimeout(function() {
            var additionalClasses = ['list-enter-active', 'row', 'g-1']
            additionalClasses.push('phb-container');
            writeCSSText(block.text(), additionalClasses)
          },delay*speed);
        }

        
      
      } else { // Otherwise, process the other block formats

        // Handle heading, if present:
        if(block.headingText !== undefined) {
          var additionalClasses = ['list-enter-active','heading-text', 'row', 'g-1']
          window.setTimeout(function() {
            writeCSSText(block.headingText(),additionalClasses)
            writeCSSText(randomSymbol(), ['list-enter-active','moon', 'row', 'g-1'])
          },delay*speed)
          noMoreDelay == false ? delay++ : {}
        }
        
        // Handle text, if present:
        if(block.text !== undefined) {
          var additionalClasses = ['list-enter-active', 'row', 'g-1']
          
          window.setTimeout(function() {
            writeCSSText(block.text(),additionalClasses)
          },delay*speed)
          noMoreDelay == false ? delay++ : {}
        }

        // Handle handwriting, if present:
        if(block.handwriting !== undefined) {
          var additionalClasses = ['list-enter-active', 'handwriting']
          window.setTimeout(function() {
            writeCSSText(block.handwriting(), additionalClasses)
          },delay*speed)
          noMoreDelay == false ? delay++ : {}
        }
      }
    }
  })

  window.setTimeout(function() {
    writePlayerOptions(gameData)
  }, speed*delay)
}

export function setVariable(gameData: GameData, key: string, val: string) {
  gameData.vars.push({k:key,v:val})
}

/**
 * Remembers a string. Recall it later with `recall():Boolean`
 * @param g GameData instance
 * @param tag The string you want to remember
 */
export function remember(g:GameData,tag:string) {
  gameData.vars.push({k:tag, v:"1"});
}

/**
 * Returns true if we remembered the tag.
 * @param g GameData
 * @param tag The tag you remember(tag)'d
 * @returns Boolean
 */
export function recall(g:GameData,tag:string) {
  return gameData.vars.filter( v => v.k == tag).length > 0 ? true : false;
}

export function play(gameData:GameData) {
  
  writeHeading(gameData.title);
  writeLead(gameData.description);

  renderCurrentSituation(gameData);

}

/**
 * 
 * @param g 
 * @param attribute The difficulty check attribute that this modifier affects.
 * @param value The value to add to the existing value. 
 * @param replaceValue Optional. If true, will replace the value instead of adding to whatever is there already.
 */
export function setDCModifier(g:GameData,label:string,attribute:string,value:number, replaceValue:boolean=false){
  let result = g.modifiers.findIndex( m => m.attribute == attribute);
  if(result == undefined) {
    g.modifiers[result].value = replaceValue ? value : g.modifiers[result].value + value;
    g.modifiers[result].label = label;
  
  } else {
    // doesn't exist yet, so just push it
    g.modifiers.push({
      attribute: attribute, 
      value: value,
      label: label
    });
  } 
}

/**
 * Saves a copy of the children of the content container, and a few other things, 
 * to facilitate the "loadGame" function. 
 * @todo This is really hacky and warrants a responsible refactor
 * @param idOfContentContainer 
 */
export function quicksave(g:GameData,idOfContentContainer:string="container") {
  
  // PART 1: SAVE THE CONTENT CONTAINER CONTENTS
  // ---------------------------------------------
  // get queryselector content container
  // for each child: 
  //  save that child in a list of children
  // save the data to localstorage
  
  // PART 2: SAVE THE GAMEDATA
  // ---------------------------------------------
  // Save a copy of the GameData

  

}


// @todo loadGame
// just plug the container and gamedata from quicksave... will it work? 
