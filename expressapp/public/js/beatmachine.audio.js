/**
 * @fileOverview BEATMACHINE - Manage the audio of the BEATMACHINE
 * @author Adriaan Scholvinck
 * @version 1.0
 */

// declare BEATMACHINE in case it has not been declared yet
window.BEATMACHINE = window.BEATMACHINE || {};

/**
 * @name BEATMACHINE.Audio
 * @namespace Manage the audio of the BEATMACHINE.
 * @description Manage the audio of the BEATMACHINE.
 * @requires BEATMACHINE
 */
BEATMACHINE.Audio = (function(BEATMACHINE, window, undefined){
	
	var config = {
		initialized: false,
		ready: null,
		audioFiles: 0,
		initialized: false,
		cdn_path: 'http://be5afa60b78d94593dd0-ea4e78a1f1e353a5bcce749c650996fe.r34.cf5.rackcdn.com/',
		dev_path: 'audio/',
		type: {
			'create':{
				'registered': false,
				'ready':null,
				'count':0,
				'total':8
			},
			'watch':{
				'registered': false,
				'ready':null,
				'count':0,
				'total':2
			}
		},
		curType: null
	},
	noteId = 0,
	_audioComplete = false,
	path = null,
	createManifest = null,
	watchManifest = null,
	timeout = null,

	/**
	 * @name BEATMACHINE.Audio-_initialize
	 * @exports BEATMACHINE.Audio-_initialize as BEATMACHINE.Audio.initialize
	 * @function
	 * @description
	 */
	_initialize = function(ready,sectionId) {

		timeout = window.setTimeout( _showBandwidth, 15000 );

		// timestamp diff
		// timeout 1s (8s)
		// show bandwidth
		// new timestamp
		// get diff from original timestamp

		config.curType = sectionId;
		config.type[sectionId].ready = config.type[sectionId].ready || ready;

		path = path || ($('#home').attr('data-prod') === 'true') ? config.cdn_path : config.dev_path;
		watchManifest = watchManifest || [
			// {id:"ambient", src:path+"ambient_128kbps.mp3"},
			// {id:"main", src:path+"main_128kbps.mp3"}
		];
		createManifest = createManifest || [
			// {id:"a0", src:path+"1.mp3"},
			// {id:"a1", src:path+"2.mp3"},
			// {id:"a2", src:path+"3.mp3"},
			// {id:"a3", src:path+"4.mp3"},
			{id:"a1", src:path+"5.mp3"},
			{id:"a2", src:path+"6.mp3"},
			{id:"a3", src:path+"7.mp3"},
			{id:"a4", src:path+"8.mp3"},
			{id:"a5", src:path+"9.mp3"},
			{id:"a6", src:path+"10.mp3"},
			{id:"a7", src:path+"11.mp3"},
			{id:"a8", src:path+"12.mp3"}
			// ,
			// {id:"a12", src:path+"13.mp3"},
			// {id:"a13", src:path+"14.mp3"},
			// {id:"a14", src:path+"15.mp3"},
			// {id:"a15", src:path+"16.mp3"},
			// {id:"a16", src:path+"17.mp3"},
			// {id:"a17", src:path+"18.mp3"}
		];

		if (!config.initialized) {
			createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
			createjs.Sound.addEventListener("fileload", _fileLoad);
		}

		var manifest = ( sectionId == 'watch' ) ? watchManifest : createManifest;

		if ( config.type[sectionId].registered ) {
			if( ready != null ) {
				ready();
				// TODO cancel timeout
				window.clearTimeout(timeout);
			}
		} else {
			config.type[sectionId].registered = true;
			createjs.Sound.registerManifest(manifest);
		}

		// prevent AUDIO from executing twice
		config.initialized = true;
	},


	/**
	 * @name BEATMACHINE.Audio-_setVolume
	 * @exports BEATMACHINE.Audio-_setVolume as BEATMACHINE.Audio.setVolume
	 * @function
	 * @description Allows public setting of volume (0 - 1). Will be used external to this class in conjunction with gyroscope
	 */
	_showBandwidth = function() {
		BEATMACHINE.updateScreen('bandwidth-check');
		// if ( config.curType == 'watch' ){
		// 	BEATMACHINE.WatchCard.destroy();
		// } else if ( config.curType == 'create' ){
		// 	BEATMACHINE.CreateCard.destroy();
		// }
		window.setTimeout( function(){
			window.location.reload();
			return;
		}, 3000 );
	},

	/**
	 * @name BEATMACHINE.Audio-_setVolume
	 * @exports BEATMACHINE.Audio-_setVolume as BEATMACHINE.Audio.setVolume
	 * @function
	 * @description Allows public setting of volume (0 - 1). Will be used external to this class in conjunction with gyroscope
	 */
	_fileLoad = function(event) {
		console.log('BEATMACHINE.Audio._fileLoad '  );
		var obj = config.type[config.curType];
		obj.count++;
		if ( obj.count == obj.total ){
			// all audio files have been downloaded
			if( obj.ready != null ) {
				obj.ready();
				// TODO cancel timeout
				window.clearTimeout(timeout);
			}
		}
	},

	/**
	 * @name BEATMACHINE.Audio-_setVolume
	 * @exports BEATMACHINE.Audio-_setVolume as BEATMACHINE.Audio.setVolume
	 * @function
	 * @description Allows public setting of volume (0 - 1). Will be used external to this class in conjunction with gyroscope
	 */
	_setVolume = function(value) {
		//console.log('BEATMACHINE.Audio.setVolume '+value);
		if( !isNaN(value) && createjs.Sound != null ) {
			createjs.Sound.setVolume(value);
		}
	},

	/**
	 * @name BEATMACHINE.Audio-_fileComplete
	 * @function
	 * @description when an audio track is completed this event fires
	 */
	_fileComplete = function(event) {
		_audioComplete = true;
	},

	/**
	 * @name BEATMACHINE.Audio-_completed
	 * @function
	 * @description getter function to get whether the audio has completed
	 */
	_completed = function() {
		return _audioComplete;
	},

	/**
	 * @name BEATMACHINE.Audio-_destroy
	 * @function
	 * @description reset the audio file
	 */
	_destroy = function(){
		createjs.Sound.stop();
		_audioComplete = false;
		// TODO cancel timeout
		window.clearTimeout(timeout);
	},

	/**
	 * @name BEATMACHINE.Audio-_arpeggio
	 * @function
	 * @description plays a single note
	 */
	_arpeggio = function() {
		if(noteId == 8) {
			flipAudioScale = true;
		} else if (noteId == 0 ){
			flipAudioScale = false;
		}

		if ( flipAudioScale ){
			noteId--;
		} else {
			noteId++;
		}

		createjs.Sound.play('a' + noteId, createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
	},

	/**
	 * @name BEATMACHINE.Audio-_play
	 * @function
	 * @description 
	 * @param {string} track id
	 * @param {object} play options 
	 */
	_play = function( trackName, options ){
		if ( !trackName ) {
			trackName = 'main';
		}

		var instance = createjs.Sound.play(trackName, options);
		if ( trackName == 'main' ) instance.addEventListener("complete", _fileComplete);
	},

	_stopTrack = function( trackName ){
		createjs.Sound.stop(trackName);
	},

	/**
	 * @name BEATMACHINE.Audio-_pause
	 * @function
	 * @description 
	 */
	_pause = function(){
		createjs.Sound.pause();
	};

	// public methods for this class
	return {
		initialize: _initialize,
		setVolume: _setVolume,
		destroy: _destroy,
		play: _play,
		pause: _pause,
		arpeggio: _arpeggio,
		completed: _completed,
		stopTrack: _stopTrack
	};

}(BEATMACHINE, window, undefined));	
