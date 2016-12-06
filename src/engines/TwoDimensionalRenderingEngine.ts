import {RenderingEngine} from "./";
import {Camera} from "../utils/Camera";
import {Entity} from "../entities/Entity";
import {Iterator} from "../utils/Iterator";

export class TwoDimensionalRenderingEngine extends RenderingEngine {
	public debugRegions : boolean;

	protected _render () : void {
		super._render();

		var context = this.viewPort.context;

		//TODO: Render Cameras in proper order
		for (var i in this._cameras) {
			this._renderCamera(this._cameras[i])
		}

		//Render HUD Entity
		if (this.HUDEntity) {
			this._renderEntity(this.HUDEntity, null);
		}
	}

	private _renderCamera (camera : Camera) : void {
		var scene = camera.scene;
		var context = this.viewPort.context;

		if (this.debugCamera) {
			//For Debugging purposes.. Draw a rect where each camera should be
			context.beginPath();
			context.rect(camera.viewPoint.x, camera.viewPoint.y, camera.fov.width, camera.fov.height);
			context.lineWidth = 7;
			context.strokeStyle = 'red';
			context.stroke();

			context.beginPath();
			context.rect(camera.renderOrigin.x, camera.renderOrigin.y, camera.renderDimension.width, camera.renderDimension.height);
			context.lineWidth = 7;
			context.fillStyle = 'black';
			context.fill();
			context.strokeStyle = 'green';
			context.stroke();
		}

		this._renderEntity(scene, camera);	
	}

	private _renderEntity (entity: Entity, camera? : Camera) : boolean {
		//Render this

		//First, make sure it's in the camera...  Don't want to waste our time on things that are not..
		//TODO: CLean up this Camera stuff a bit so _renderEntity isn't aware of cameras...
		if (camera) {
			var collidesYAxis = false;
			var collidesXAxis = false;

			var cameraBounds = {
				x: camera.viewPoint.x,
				y: camera.viewPoint.y,
				x2: camera.viewPoint.x + camera.fov.width,
				y2: camera.viewPoint.y + camera.fov.height
			};

			var entityBounds = {
				x: entity.getAbsoluteX(),
				y: entity.getAbsoluteY(),
				x2: entity.getAbsoluteX2(),
				y2: entity.getAbsoluteY2()
			};

		    if ((entityBounds.x < cameraBounds.x2 && entityBounds.x2 > cameraBounds.x)
		        || (entityBounds.x2 > cameraBounds.x && entityBounds.x < cameraBounds.x2)) {
		        collidesXAxis = true;
		    }

		    if ((entityBounds.y < cameraBounds.y2 && entityBounds.y2 > cameraBounds.y)
		        || (entityBounds.y2 > cameraBounds.y && entityBounds.y < cameraBounds.y2)) {
		         collidesYAxis = true;
		     }


			//We'll check to see if the entity collides in the cameras x and y axis, if both, it's visible.
			if (!collidesYAxis || !collidesXAxis) {
				// console.log("Found an entity outside the cameras view, ignoring!", entity);
				//Not visible in the camera, do not continue rendering this entity or it's children
				return false;
			}

			// if (entity.collectTextures().length > 0) {
			
			//Next, we figure out what parts of it are in the camera, so we can clip it if need be
			//Check for Left Clip
			var leftClip = 0;
			if (entity.getAbsoluteX() < camera.viewPoint.x) {
				leftClip = camera.viewPoint.x - entity.getAbsoluteX();
			}
			// console.log("Left Clip", leftClip);

			//Check for Right Clip
			var rightClip = 0;
			if (entity.getAbsoluteX2() > (camera.viewPoint.x + camera.fov.width)) {
				rightClip = entity.getAbsoluteX2() - (camera.viewPoint.x + camera.fov.width);
			}
			// console.log("Right Clip", rightClip);

			//Check for Top Clip
			var topClip = 0;
			if (entity.getAbsoluteY() < camera.viewPoint.y) {
				topClip = camera.viewPoint.y - entity.getAbsoluteY();
			}
			// console.log("Top Clip", topClip);


			//Check for Bottom Clip
			var bottomClip = 0;
			if (entity.getAbsoluteY2() > (camera.viewPoint.y + camera.fov.height)) {
				bottomClip = entity.getAbsoluteY2() - (camera.viewPoint.y + camera.fov.height);
			}
			// console.log("Bottom Clip", bottomClip);

			//Now we figure out how to skew the rendering, since the render dimensions of the camera may not match it's fov
			var xModifier = camera.fov.width / camera.renderDimension.width;
			var yModifier = camera.fov.height / camera.renderDimension.height;

			var cameraRelativeY = (entityBounds.y - cameraBounds.y) / yModifier;
			if (cameraRelativeY < 0) {
				cameraRelativeY = 0;
			}

			var cameraRelativeX = (entityBounds.x - cameraBounds.x) / xModifier;
			if (cameraRelativeX < 0) {
				cameraRelativeX = 0;
			}

			var clippedEntityHeight = (entity.height - topClip - bottomClip);
			var clippedEntityWidth = (entity.width - rightClip - leftClip);

			var x = camera.renderOrigin.x + cameraRelativeX;
			var y = camera.renderOrigin.y + cameraRelativeY;
			var w = clippedEntityWidth / xModifier;
			var h = clippedEntityHeight / yModifier;

			//Rendering time!
			if (entity.color){
				//Draw a rect in its place...
				var color = entity.color;
				this.viewPort.context.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
				this.viewPort.context.fillRect(x, y, w, h);
			}

			//Debug Flag
			if (this.debugRegions) {
				for (var x_i in entity.regions) {
					for (var y_i in entity.regions[x]) {
						if (entity.regions[x_i][y_i].length > 0) { 
							// this._viewPort.context.fillStyle = "rgb(" + Math.floor((Math.random() * 255) + 1) + "," + Math.floor((Math.random() * 255) + 1) + "," + Math.floor((Math.random() * 255) + 1) + ")";
							this.viewPort.context.strokeStyle = "red";
							this.viewPort.context.strokeRect(entity.getAbsoluteX() + entity.regionDimension.width * parseInt(x_i), entity.getAbsoluteY() + entity.regionDimension.height * parseInt(y_i), entity.regionDimension.width, entity.regionDimension.height);
						}
					}
				}
				// Math.floor((Math.random() * 255) + 1), Math.floor((Math.random() * 255) + 1), Math.floor((Math.random() * 255) + 1)
			}

			if (entity.texture) {
				//TODO: Grab the Cached version of it if available, 
				var imageData = entity.texture.getData();

				var entityToImageYModifier = imageData.height / entity.height;
				var entityToImageXModifier = imageData.width / entity.width;

				var clippedImageHeight = clippedEntityHeight * entityToImageYModifier;

				var clippedImageWidth =  clippedEntityWidth * entityToImageXModifier;

				this.viewPort.context.drawImage(imageData, leftClip * entityToImageXModifier , topClip * entityToImageYModifier, clippedImageWidth, clippedImageHeight, x, y, w, h)
			}

		} else {
			//No camera, static entities relative to the canvas
			var x = entity.x;
			var y = entity.y;
			var w = entity.width;
			var h = entity.height;

			//Rendering time!
			if (entity.color){
				//Draw a rect in its place...
				var color = entity.color;
				this.viewPort.context.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
				this.viewPort.context.fillRect(x, y, w, h);
			}

			if (entity.texture) {
				//TODO: Grab the Cached version of it if available, 
				var imageData = entity.texture.getData();

				var entityToImageYModifier = imageData.height / entity.height;
				var entityToImageXModifier = imageData.width / entity.width;

				var clippedImageHeight = clippedEntityHeight * entityToImageYModifier;

				var clippedImageWidth =  clippedEntityWidth * entityToImageXModifier;

				this.viewPort.context.drawImage(imageData, x, y, w, h)
			}
		}


		//TODO: Update this to render entities top-down
		//TODO: Only navigate if isModified
		var children = entity.getChildren();

		while (children.hasNext()) {
			this._renderEntity(children.next(), camera);
		}
		return true;
	}
}
