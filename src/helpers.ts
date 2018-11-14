import './assets/styles/main.scss';

let helpersInstance: Helpers;

class Helpers {


	/**
	*
	* It will enable the svg engine. After that you can use your svg in you html like:

	  <svg class="svg-icon">
	    <use xlink:href="#icon-rocket"></use> 
	  </svg>

	  Where #icon-rocket    is the id of your svg (icon-    is a system prefix. So the origin svg name is: rocket.svg)
	*
	* Svg sources placed it the src/assets/svg
	*/

	public initSvgEngine() {


		let __svg__: any = { path: './assets/svg/**/*.svg', name: '[hash].spritemap.svg' };

		let regPattern: RegExp = /^(?:http(?:s)?):\/\/.*\/(.*)/;

		if (__svg__.filename && regPattern.test(__svg__.filename)) {
			__svg__.filename = __svg__.filename.match(regPattern)[1];
		}



		require('webpack-svgstore-plugin/src/helpers/svgxhr')(__svg__);
	}


}

function makeSingle() {
	if (!helpersInstance && !(helpersInstance instanceof Helpers)) {
		helpersInstance = new Helpers();
	} 

	return helpersInstance;
}

export default makeSingle();