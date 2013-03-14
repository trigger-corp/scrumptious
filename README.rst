How to build Scrumptious
========================

Scrumptious is a demo app showing the integration between Trigger.io and Facebook. It let's you post to Facebook with details about your current location and what meal you're eating with whom. You can find out more about our `integration with Facebook <http://docs.trigger.io/en/v1.4/modules/facebook.html>`_ in the documentation. 

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
   * rm -rf *

3. Checkout this repository and copy the identity.json file back:

   * git clone https://github.com/trigger-corp/scrumptious.git .
   * cd ..
   * mv identity.json src/

Running the app
---------------

At the command-line, simply run 'forge build ios' and 'forge run ios' while in the app directory.

In the Toolkit, select the app and then click the 'iOS' link to build and run it. The first time this will take a minute or so, subsequent incremental builds will be very fast. You'll see the full console output in the Toolkit and the iPhone simulator will start up in a few seconds.