import ViewPort from "./Utils/ViewPort";
import Camera from "./Utils/Camera";
import {AudioEngine} from './Audio/AudioEngine';
import HTML5AudioEngine from "./Audio/HTML5AudioEngine";
import {AssetFactory} from './Assets/AssetFactory';
import RenderingEngine from "./Engines/RenderingEngine";
import {LogManager, SeverityEnum} from "./Utils/LogManager";

//Typescript Testing Imports
import TwoDRenderingEngine from "./Engines/TwoDRenderingEngine";
import GroupLogicEngine from "./Engines/GroupLogicEngine";
import GridMap from "./Entities/GridMap";
//End//

export default class Engine {
	public renderingEngine : RenderingEngine;
	public audioEngine : AudioEngine;
	public logManager : LogManager;
	public assetFactory : AssetFactory;
	public viewPort : ViewPort;
	private debugMode : boolean;

	constructor () {
		this.debugMode = false;

		this.logManager = LogManager.getInstance();

		//Setup the default AssetFactory
		this.assetFactory = AssetFactory.getSingleton();

		this.audioEngine = new HTML5AudioEngine();

		//Create the ViewPort
		this.viewPort = new ViewPort();

		//If Engine is ready, notify our callback
		if (this.onInit) {
			this.logManager.log(SeverityEnum.INFO, 'Engine has started.');
			this.onInit(this.viewPort.canvas)
		} else {
			this.logManager.log(SeverityEnum.WARNING, 'No onInit specified for Zengine. How will you know when to start using it?!');
		}
	}

	public onInit (canvas : HTMLCanvasElement) : void {

	}
}