# AWS Role Switcher Chrome Extension
A simple Chrome extension designed for PPO organization members to quickly switch between pre-configured AWS IAM roles without manually entering credentials.

## What It Does
This extension streamlines your AWS workflow by automating three key steps:
+ **Tab Management:** When you click the extension icon, it automatically finds or opens the AWS Switch Role page (https://*.signin.aws.amazon.com/switchrole).

+ **Profile Selection:** It displays a quick, searchable list of your organization's configured AWS roles (Display Name, Account ID, Role Name).
+ **One-Click Switch:** Upon selecting a role, the extension instantly injects the data into the AWS form fields (Account ID, Role Name, Display Name, and Color) and clicks the "Switch Role" button.

## What It Doesn't Do (Limitations)
- It doesn't switch accounts - I switches roles which are set using permission elevation from a main role.
  
- The PPO AWS Role Switcher is designed for simplicity and security, which imposes the following limitations:
- No Credential Storage: This extension does not store or manage your AWS credentials (user name, password, MFA token, or access keys). 
- It only works after you have successfully logged into the AWS Management Console with an IAM user or federated identity.
- No Automatic Data Fetching: The extension cannot automatically fetch profile data from a shared resource (like Google Drive, S3, or Confluence). 
- The configuration must be manually loaded via the Options Page.
No Role Creation/Editing: You cannot create or edit role profiles directly within the extension's popup. 
- All configuration changes must be made in the organization's centralized .json file and re-imported via the Options Page.
- No Direct Console Integration: The extension does not modify the existing AWS UI elements or the functionality of the AWS console itself (other than changing the header color upon a successful switch).
  

## Setup and Configuration 
#### 1. Load the Extension
1. Navigate to `chrome://extensions`

2. Enable Developer mode (top right toggle).
Click "Load unpacked" and select the root directory of the extension files

#### 2. Configure Profiles
The extension is will not work until you load your organization's configuration file.
1. Right-click the extension icon or navigate to "Extension options" via `chrome://extensions -> Details`.
2. On the Options Page, upload the organization's roles.json file.
   
   Click "Import Profiles" to save the configuration to your browser's local storage.
3. Required roles.json Schema
   Your configuration file must be a JSON array with the following mandatory fields for each profile:
  
| Field | Description | Example | 
|---|---|---|
| displayName | Name displayed in the popup | "Dev Account - Auditor" |
| accountID | The 12-digit AWS account number | "123456789012"| 
| roleName | The exact IAM Role name to assume | "OrganizationAccountAccessRole"
| color | The AWS header color after switching | "Blue" |

#### roles.json sample:
```
[
  {
      "displayName": "Client 1",
      "accountID": "123412341234",
      "roleName": "OrganizationAccountAccessRole",
      "color": "None"
  },
  {
      "displayName": "API logger",
      "accountID": "234523452345",
      "roleName": "api-gateway-logger",
      "color": "Red"
  },
  {
    "displayName": "ECS Instance Role",
    "accountID": "987987654654",
    "roleName": "ecsInstanceRole",
    "color": "Orange"
  }
]
```

## Usage
Ensure you are logged into the AWS Management Console in a tab.
Click the PPO AWS Role Switcher icon in your Chrome toolbar.
Select the desired role from the list.
The extension handles the form filling and role submission instantly.
