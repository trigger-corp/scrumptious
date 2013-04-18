How to build Scrumptious
========================

Scrumptious is a demo app showing the integration between Trigger.io and Facebook. It let's you post to Facebook with details about your current location and what meal you're eating with whom. You can find out more about our `integration with Facebook <http://current-docs.trigger.io/modules/facebook.html>`_ in the documentation. 

This app is based on the Scrumptious web app: https://github.com/fbsamples/web-scrumptious. It has been modified to make use of the following Trigger.io features:

	* Native Facebook SDK integration for login, data access and open graph calls: http://current-docs.trigger.io/modules/facebook.html#modules-facebook
	* Native topbar and button navigation: http://current-docs.trigger.io/modules/topbar.html
	* Native geolocation (using GPS): http://current-docs.trigger.io/modules/geolocation.html
	* Native notifications: http://current-docs.trigger.io/modules/notification.html

Here are the steps to build and test this app on a Mac in the iOS emulator.

The steps to test on Windows / Android are similar and you can find more information here on `Getting started with Trigger.io <http://current-docs.trigger.io/getting-started/index.html>`_.


Install the Trigger.io Toolkit
-------------------------------

1. Install the toolkit from https://trigger.io/forge/toolkit
2. Start the Toolkit and login to your Trigger.io account
3. Select your Project, create a new app and note the app directory

Getting the code
----------------

1. Open a terminal and navigate to your app directory.
2. Copy your identity.json file away and remove all the other contents in your src directory:

   * cd src
   * mv identity.json ..
   * mv .forgeignore ..
   * rm -rf *

3. Checkout this repository and copy the identity.json file back:

   * git clone https://github.com/trigger-corp/scrumptious.git .
   * cd ..
   * mv identity.json src/
   * mv .forgeignore src/

Preparing your own version ready for deployment
-----------------------------------------------

You will need to create your own Facebook app and host certain files on your webserver to run the app correctly

1. Create a new app at https://developers.facebook.com/apps

	* Define a unique namespace
	* Specify a site url (in the 'Website with Facebook Login' section) and app domain corresponding to your webserver
	* Complete the 'Native iOS App' and 'Native Android App' sections, some tips are provided in our documentation here: http://current-docs.trigger.io/modules/facebook.html#tips
	
2. Configure the requirement Open Graph action and object

	* Follow this tutorial to create the 'eat' action and 'meal' object: https://developers.facebook.com/docs/tutorials/androidsdk/3.0/scrumptious/publish-open-graph-story/
	
3. Change the src/config.json file to reflect your Facebook configuration

	* The "appid" in the "facebook" module configuration needs to reflect your own Facebook appid
	* The "ios" parameter in the "package_names" module must be the same as the "Bundle ID" you specified in the 'Native iOS App' section when you created your Facebook app

4. Change the code to replace your namespace and urls

	* In 'main.js' replace "/me/trigger-scrumptious:eat" with "/me/<YOUR_NAMESPACE>:eat"
	* In 'main.js' replace the "https://s3.amazonaws.com/trigger-scrumptious" part of the urls with the path to your own webserver / static file hosting where you will host your object files
	* In each of the .html files in the 'web' subdirectory, replace the "https://s3.amazonaws.com/trigger-scrumptious" part of the urls with the path to your own webserver / static file hosting where you will host your object files
	* In each of the .html files in the 'web' subdirectory, replace "trigger-scrumptious:meal" with "<YOUR_NAMESPACE>:meal"

5. Host the necessary resources on your website

	* Deploy all the files in the 'web' subdirectory to your webserver / static file hosting making sure the urls correspond to those in .html files and main.js that you replaced in step 4.


Now you're ready to try the app out!


Running the app
---------------

For complete details on building / running apps with Trigger.io see our getting started guide:
http://current-docs.trigger.io/mobile.html

At the command-line, simply run 'forge build [ios|android]' and 'forge run [ios|android]' while in the app directory. 

In the Toolkit, select the app and then click the 'iOS' or 'Android' links to build and run it. The first time this will take a minute or so, subsequent incremental builds will be very fast. You'll see the full console output in the Toolkit and the iPhone simulator will start up in a few seconds.