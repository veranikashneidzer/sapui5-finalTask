# [Module 7] Master Detail Practical Task
## [Task 7-1] Create a New Git Repository

- Create a new repository for your SAPUI5 project (GitHub https://github.com/ ). 
- Use Public repository. 
- Name the repository clearly (e.g., sapui5-finalTask). 

## [Task 7-2] Generate new empty application

- App could be generated via Fiori Application Generator in VS Code. This Generator is coming from SAP Extension pack that you should have from week 1. 
- Open command pallet and type ‘Fiori Application Generator’, you should see it in the list. 
- Select ‘Basic’ template. 
- For Data Source select ‘None’. 
- For View name use ‘Main’. 
- On next screen ‘Project Attributes’ no changes are required, click on ‘Finish’. If you want you can change module name and app’s title and description to something more logical, but this is not mandatory. 

Note: In case of any difficulties, you can take empty project from this repo. Link - [Repo with empty project](https://github.com/nulanovs/SAPUI5_Learning_Course)

## [Task 7-3] Complete the task

Create a new branch ‘feature/task-7-1’ from main, checkout to it. 

In this module we’ll focus entirely on practice, with no new theory to cover. 

Please feel free to reuse the code you’ve written in earlier modules as you work through the exercises. 

Once you wrap up this module, we’ll begin exploring the next topic: SAP Fiori Elements. 

Objective:   

Your task is to design and develop a functional application that meets the following requirements. The goal is for you to explore and apply the appropriate tools and techniques on your own. You are encouraged to research, experiment, and make decisions independently.   


Requirements:

     1. Data Integration:  

The application must utilize an oData v2 model for data handling (you can use the same approach with mock-server that we have used before).  

     2. Master-Detail Layout:  
Implement a master-detail layout ([Example of Master-Detail layout](https://sapui5.hana.ondemand.com/test-resources/sap/m/demokit/orderbrowser/webapp/test/mockServer.html?sap-ui-theme=sap_horizon_dark) ) to display and interact with data.  
The master page should allow users to filter the displayed data and trigger creation of new record (navigation to object page).  

     3. Object Page Functionality:  
The object page should include:   
A possibility to go into edit mode to update existing data (edit mode should support save and cancel actions).  
A delete functionality to remove item.  
A creation functionality should also navigate and happen on the Object page.  

      4. User Experience:  
Ensure the application is intuitive and user-friendly.  
It should be possible to share the link to the exact object page  

 Following this [link](https://sapui5.hana.ondemand.com/#/demoapps) you can also download sample app to check the code implementation of Master-Detail layout.

# [Module 8] Fiori elements

## [Theory] Fiori elements

- ﻿[SAP Fiori Elements Overview](https://www.sap.com/design-system/fiori-design-web/discover/frameworks/sap-fiori-elements/smart-templates) 
- ﻿[Why use SAP Fiori Elements?](https://sapui5.hana.ondemand.com/sdk/#/topic/0a5377076f4e4ccba055a9072befadbd) 
- ﻿[SAP Fiori Elements Floorplans Overview](https://sapui5.hana.ondemand.com/sdk/#/topic/797c3239b2a9491fa137e4998fd76aa7)

## [Task 8-1] SAP Fiori Elements

Fiori Elements is a tool provided by SAP to help developers create business applications quickly and easily. It uses pre-built templates and requires very little coding, so you don’t need to be an expert in designing or programming. It ensures that all apps look consistent, work well on all devices, and follow SAP's modern design standards.  

SAP provides good course that we will use for this learning 
[Developing an SAP Fiori Elements App Based on a CAP OData V4 Service](https://learning.sap.com/courses/developing-an-sap-fiori-elements-app-based-on-a-cap-odata-v4-service) 

﻿﻿Please start with Unit 1 and complete all units under this course. 
It will give you both theory and practical tasks.  

Notes:  
> In Unit 1, part Getting started , there is a configuration of BAS, you can skip it and proceed with VS Code.

## [Task 8-2] Create new repository

Create a new repository for your SAPUI5 project at https://github.com/ . 
Use Public repository. 
Name the repository sapui5-error-analysis 
Clone the project from [this link](https://github.com/nulanovs/ManageProducts) .

## [Task 8-3] App Enhancements

Proceed with a repository from task 8-2. 

Note: to start the application locally do not forget to install node modules and use ‘npm run start-mock’ command. 

Create a new branch ‘feature/task-8-3’ from main, checkout to it. 
Implement the following requirements:
 Counter is showed only for shortage items, but for ‘Out of stock’ and ‘Plenty in stock’ it is missing, please fix it. 

Now it is possible to click these buttons (Order and Remove) while none of the records are selected. We want to enable these buttons only when at least one record on the table is selected. 

Button ‘Order’ currently does not work at all. When we click on ‘Order’ button it should update ‘Units In Stock’ field for selected records by adding 5 to existing value. In this example it would be 59 + 5, so new value should be 64. 

Search field is case sensitive. Please change it to be opposite. 
