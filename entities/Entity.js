/**
 * public class Entity
 *
 *	An entity controller class.
 *
 * 	Entity manipulates the EntityModel which will fire events that the
 * 	EntityView(a listener) will receive, and react upon.
 *
 * All Entity objects must have a model. If no model is given during construction
 * Then a new model is created.
 * 
 * @param {zen.entities.EntityModel} model If null/undefined, then Entity will create a new one.
 */
zen.entities.Entity = function(model) {
	var useDefaults = false;
	if (!model) {
		model = new zen.entities.EntityModel();
		useDefaults = true;
	}
	
	this.setModel(model);
	this.view = new zen.entities.EntityView(model);
	
	this.children = new Array();
	this.parent;

	if (useDefaults) {
		this._setDefaults();
	}
};

zen.extends(null, zen.entities.Entity, {

	//MODEL / VIEW / IDENTITY BASE

	/**
	 * public setModel
	 *
	 *	Sets the model that this Entity manipulates.
	 * 
	 * @param {zen.entities.EntityModel} model 
	 * @return {void} 
	 */
	setModel : function(model) {
		if (!model) {
			throw new Error('undefined/null EntityModel');
		}
		this.model = model;
	},

	/**
	 * public getModel
	 *
	 *	Gets the EntityModel that this Entity manipulates.
	 * 
	 * @return {zen.entities.EntityModel} 
	 */
	getModel : function() {
		return this.model;
	},

	/**
	 * public getID
	 *
	 *	Gets the GUID of the entity that this is manipulating.
	 * 
	 * @return {String}
	 */
	getID : function() {
		return this.model.getID();
	},

	/**
	 * public setType
	 *
	 *	Sets the type of this entity.
	 * 
	 * @param {String} type 
	 */
	setType : function(type) {
		this.model.setType(type);
	},

	/**
	 * public getType
	 *
	 *	Gets the type of this entity.
	 * 
	 * @return {String} 
	 */
	getType : function() {
		return this.model.getType();
	},

	/**
	 * public getView
	 *
	 *	Gets the EntityView.
	 * 
	 * @return {zen.entities.EntityView} 
	 */
	getView : function() {
		return this.view;
	},

	//COMPOSITE 

	/**
	 * public addChild
	 *
	 *	Adds a child entity node to this entity.
	 * 
	 * @param {zen.entities.Entity} child 
	 * @return {void}  
	 */
	addChild : function(child) {
		var parent = child.getParent();
		if (parent) {
			parent.removeChild(child);
		}
		this.children.push(child);
		child.setParent(this);
	},

	/**
	 * public removeChild
	 *
	 *	Removes a child entity node from this entity.
	 * 
	 * @param  {zen.entities.Entity} child 
	 * @return {void}       
	 */
	removeChild : function(child) {
		if (this.isChild(child)) {
			var idx = this.indexOf(child);
			this.children.splice(idx, 1);
		}
	},

	/**
	 * public removeAllChildren
	 *
	 *	Removes all child nodes of this entity.
	 * 
	 * @return {void} 
	 */
	removeAllChildren : function() {
		var child;
		while (child = this.getChildAt(0)) {
			this.removeChild(child);	
		}
	},

	/**
	 * public isChild
	 *
	 *	Checks to see if the given entity is a child of
	 *	this entity.
	 * 
	 * @param  {zen.entities.Entity}  child 
	 * @return {Boolean}       
	 */
	isChild : function(child) {
		return (this.indexOf(child) > -1);
	},

	/**
	 * public indexOf
	 *
	 *	Finds the index of the given entity.
	 * 
	 * @param  {zen.entities.Entity} child 
	 * @return {Integer}       
	 */
	indexOf : function(child) {
		return this.children.indexOf(child);
	},

	/**
	 * public childCount
	 *
	 *	Counts the number of child nodes inside this entity.
	 * 
	 * @return {Integer} 
	 */
	childCount : function() {
		return this.children.length;
	},

	/**
	 * public getChildAt
	 *
	 *	Gets a child entity at the given index.
	 * 
	 * @param  {Integer} index 
	 * @return {zen.entities.Entity}       
	 */
	getChildAt : function(index) {
		return this.children[index];
	},

	/**
	 * public setParent
	 *
	 * Sets the parent entity of this entity.
	 * Even though this is public, it should only be used internally.
	 * 
	 * @param {zen.entities.Entity} parent 
	 * @return {void}
	 */
	setParent : function(parent) {
		this.parent = parent;
	},

	/**
	 * public getParent
	 *
	 *	Gets the parent entity node.
	 *	Be prepared to handle undefined or null.
	 * 
	 * @return {zen.entities.Entity} May be undefined or null.
	 */
	getParent : function() {
		return this.parent;
	},

	/**
	 * public iterator
	 *
	 *	Creates a child node iterator for this entity.
	 * 
	 * @return {Object} {
	 *         hasNext : function()
	 *         next : function()
	 *         hasPrevious : function()
	 *         previous : function()
	 * }
	 */
	iterator : function() {
		var i = -1;
		var self = this;
		return {
			hasNext : function() {
				var child = self.getChildAt(i + 1);
				return !(child === undefined || child === null);
			},

			next : function() {
				i++;
				return self.getChildAt(i);
			},

			hasPrevious : function() {
				var child = self.getChildAt(i);
				return !(child === undefined || child === null);
			},

			previous : function() {
				i--;
				return self.getChildAt(i);
			}
		};
	},

	//GEOMETRY
	
	/*
			ALL COORDINATES ARE RELATIVE TO THE ENTITIES DIRECT
			PARENT.
	 */
	
	/**
	 * public setX
	 *
	 *	Sets the x coordinate of this entity.
	 * 
	 * @param {Integer} x 
	 */
	setX : function(x) {
		this.model.setAttribute('x', x);
	},

	/**
	 * public getX
	 *
	 *	Gets the x coordinate of this entity.
	 * 
	 * @return {Integer}
	 */
	getX : function() {
		return this.model.getAttribute('x');
	},

	/**
	 * public setY
	 *
	 *	Sets the y coordinate of this entity.
	 * 
	 * @param {Integer} y 
	 */
	setY : function(y) {
		this.model.setAttribute('y', y);
	},

	/**
	 * public getY
	 *
	 *	Gets the y coordinate of this entity.
	 * 
	 * @return {Integer} 
	 */
	getY : function() {
		return this.model.getAttribute('y');
	},

	/**
	 * public setZ
	 *
	 *	Sets the z coordinate of this entity.
	 * 
	 * @param {Integer} z 
	 */
	setZ : function(z) {
		this.model.setAttribute('z', z);
	},

	/**
	 * public getZ
	 *
	 *	Gets the z coordinate of this entity.
	 * 
	 * @return {Integer} 
	 */
	getZ : function() {
		return this.model.getAttribute('z');
	},

	/**
	 * public setLocation
	 *
	 *	Sets the coordinates of this entity. All arguments are optional.
	 * 
	 * @param {Integer} x 
	 * @param {Integer} y 
	 * @param {Integer} z 
	 */
	setLocation : function(x, y, z) {
		if (x !== null && x !== undefined) {
			this.setX(x);
		}
		if (y !== null && y !== undefined) {
			this.setY(y);
		}
		if (z !== null && z !== undefined) {
			this.setZ(z);
		}
	},

	/**
	 * public getLocation
	 *
	 *	Gets the coordinates of this entity.
	 * 
	 * @return {Object} {
	 *         x : integer,
	 *         y : integer,
	 *         z : integer
	 * }
	 */
	getLocation : function() {
		return {
			x : this.getX(),
			y : this.getY(),
			z : this.getZ()
		};
	},

	/**
	 * public setHeight
	 *
	 * 	Sets the height of this entity.
	 * 
	 * @param {Integer} height 
	 */
	setHeight : function(height) {
		this.model.setAttribute('height', height);
	},

	/**
	 * public getHeight
	 *
	 *	Gets the height of this entity.
	 * 
	 * @return {Integer} 
	 */
	getHeight : function() {
		return this.model.getAttribute('height');
	},

	/**
	 * public setWidth
	 *
	 *	Sets the width of this entity
	 * 
	 * @param {Integer} width 
	 */
	setWidth : function(width) {
		this.model.setAttribute('width', width);
	},

	/**
	 * public getWidth
	 *
	 *	Ges the width of this entity.
	 * 
	 * @return {Integer} 
	 */
	getWidth : function() {
		return this.model.getAttribute('width');
	},

	/**
	 * public setSize
	 *
	 *	Sets the width and height of this entity.
	 *	All arguments are optional.
	 * 
	 * @param {Integer} width  
	 * @param {Integer} height 
	 */
	setSize : function(width, height) {
		if (width !== null && width !== undefined) {
			this.setWidth(width);
		}
		if (height !== null && height !== undefined) {
			this.setHeight(height);
		}
	},

	/**
	 * public getSize
	 *
	 *	Gets the width and height of this entity.
	 * 
	 * @return {Object} {
	 *         width 	: integer,
	 *         height 	: integer
	 * }
	 */
	getSize : function() {
		return {
			width: this.getWidth(),
			height : this.getHeight()
		};
	},

	/**
	 * public setVisible
	 *
	 *	Sets whether this entity should be visible or not.
	 * 
	 * @param {Boolean} state 
	 */
	setVisible : function(state) {
		this.model.setAttribute('visible', state);
	},

	/**
	 * public isVisible
	 *
	 *	Checks to see if this entity is visible.
	 * 
	 * @return {Boolean} 
	 */
	isVisible : function() {
		return this.model.getAttribute('visible');
	},

	/**
	 * private _setDefaults
	 *
	 *	Sets the default attributes for this entity.
	 * 
	 * @return {void} 
	 */
	_setDefaults : function() {
		this.setLocation(0, 0, 0);
		this.setSize(0, 0);
		this.setVisible(true);
	}
});