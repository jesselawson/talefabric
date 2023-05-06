

export enum PlayerOptionType {
  LINK, // A link choice processes its actionList, which may or may not 
        // include a goToScenario() call
  ROLL, // A roll choice requires a d20 roll, and has pass/fail scenarios.
}


/**
 * A modifier affects D20 DC rolls. These are influnced with getDCModifier and 
 * setDCModifier.
 */
export interface DCModifier {
  label: string, // e.g., "Poisoned"
  attribute: string, // if `all`, then all DC rolls will be affected. 
  value: number    // The modifier value. Can be negative. 
}

/**
 * A Player Option is part of a set of options defined in each {@link Situation | `Situation`}. 
 * 
 */
export interface PlayerOption {
  id: string,

  /**
   * Callback function that must return a string, which will be added as the 
   * `innerHTML` of the player option.
   */
  text():string,

  /**
   * If the option's {@link PlayerOption.renderCondition | `Render Condition`} is 
   * set, that render condition must return `true` for this option to be rendered
   * to the player. Otherwise, defaults to `true`.
   */
  renderCondition?(gameData:GameData):Boolean,

  /**
   * If given, will override what we write as history.
  */
  logEntry?: string,

  /** 
   * If given, will not clear whole container and instead only 
   * clear THIS option (e.g., when just displaying text)
  */
  dontClear?: Boolean,

  /** 
   * Used internally to track whether we should display this one again
  */ 
  alreadySelected?: Boolean,

  /** 
   * If provided, selecting this text will cause a dice roll. 
   * If the dice roll is >= dc, then onPass is called. 
   * If it's < dc, then onFail is called. 
   * (If dc is  not provided, onPass is called).
  */
  dc?: number,

  /**
   * If {@link PlayerOption.dc | `dc`} is provided, `dcAttribute` must be the 
   * attribute for which the player is making the DC check. For example, if 
   * the player is making a dex saving through, this would be `dexterity`. 
   */
  dcAttribute?: string,

  /**
   * If true, the DC check will not show success or fail (hidden result from player)
  */
  hideDCResult?: boolean,
  
  /**
   * The default selection behavior for this option. Selecting an option 
   * will always cause its `onPass()` function to be called, except when 
   * `dc` is set. When `dc` is set, a d20 roll against the provided `dc` 
   * will lead to **either** `onPass()` or `onFail()` being called. 
   */
  onPass(gameData:GameData):void,
  
  onFail?(gameData:GameData):void
}


export type SituationId = string;

/**
 * A Situation is comprised of one or more {@link Block | `Content Blocks`} and associated 
 * Player Options. When the Situation starts, all of the 
 * content blocks are parsed then the player options are provided 
 * at the end. 
 */
export interface Situation {
  id: SituationId,
  
  /**
   * {@link Block | `Content Blocks`} are individual units of content displayed 
   * to the player when the situation starts.
   */
  contentBlocks: Block[],

  /**
   * Player options are the set of choices that a player is 
   * given once all the {@link Block | `Content Blocks`} are parsed. 
   */
  playerOptions: PlayerOption[]
}

export type GameVar = {
  k: string;
  v: string;
}

/**
 * A Character is used by Dialogue Content Blocks.
 */
export type Character = {
  id: string;
  name: string;
  portrait: string;
}

/**
 * One GameData instance is equivalent to the notion of a "saved game". It 
 * represents the player state (maybe in the middle of a game, maybe at the 
 * very start) a player is experiencing as well as a saved game one might 
 * load up and resume at a later time.
*/
export interface GameData {
  situations: Situation[];
  currentSituation: SituationId;
  characters: Character[];
  
  /// Title of this gameData's pack
  title: string;
  description: string;
  // @todo picture: string; // a path to a photo for the game gallery

  vars: GameVar[];

  /**
   * The last DC roll is always stored here so that no matter where you are in 
   * a narrative, you always know what the player rolled last. This is admitedly
   * a poor way to implement this--but I'm very tired right now. A lot of good 
   * people have been fired or laid off and it's weighing on my conscience. 
   */
  lastD20Roll: number;

  /**
   * Througout the game you can keep track of d20 modifiers here. 
   * The way these objects are emitted is like this:
   * 
   *   <label> <value>
   * 
   * The `attribute` is behind the scenes; it corresponds to the attribute that 
   * affects the roll. 
   */
  modifiers: DCModifier[];
}

export enum BlockFormat {
  help = 0,
  dialogue,
  image
}

/**
 * A Block is a unit of "content," and represents the basic building block of 
 * the player's experience. A {@link Situation | `Situation`} is comprised of 
 * Blocks (stored in {@link Situation.contentBlocks}) 
 */
export interface Block {
  /// If given, is rendered in Block
  headingText?: Function,

  /// The main text
  text?: Function,

  /**
   * If given, will override the default rendering pipeline for this Block. 
   * The default rendering pipeline for Blocks is as follows:
   * - First, `headingText` is rendered, if provided
   * - Second, `text` is rendered, if provided
   * - Third, `handwriting` is rendered, if provided
   * 
   * If explicitly set to `dialogue`, then the following are also required:
   * - `characterId`
   * - `text`
   * 
   * If explicitly set to `image`, then the following are also required:
   * - `image`
  */
  format?: BlockFormat,

  image?: string; 
  
  /// If given, presents the block as handwritten text. Will always be written 
  /// after `text`.
  handwriting?: Function,

  /// If given, will point to the id of the 'characters' portrait for
  /// this BlockFormat.dialogue format.
  characterId?: string,

  /// If given, only will render if condition is satisfied
  renderCondition?: (gameData:GameData) => Boolean
}

