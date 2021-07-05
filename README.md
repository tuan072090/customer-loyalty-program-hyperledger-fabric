[![Build Status](https://travis-ci.org/IBM/customer-loyalty-program-hyperledger-fabric-VSCode.svg?branch=master)](https://travis-ci.org/IBM/customer-loyalty-program-hyperledger-fabric-VSCode)

# Customer Loyalty Program with blockchain
### Fabric version 2.2

A customer loyalty program allows companies to reward customers who frequently make purchases. Program members are able to earn points on purchases, which can translate into some type of reward such as discount, freebie or special customer treatment. The members work toward a certain amount of points to redeem their reward. These programs can have multiple companies as partners on the program, to cater to a customer base. However, current loyalty program systems are restraint on relations between partners, and with visibility to members. These restraints can be removed by creating the customer loyalty program on a blockchain network.

This blockchain model for a customer loyalty program enhances the value of points to loyalty program members and brings in new value to the partners by creating trusted transactions. Participants in this network have a more level relation among each other and points are in the centric position to connect all participants.

In this code pattern, we will create a customer loyalty program as a blockchain web application using Hyperledger Fabric and Node.js. The application will allow members to register on the network where they will create their account. They will be identified on the network with their account number and will create an access key which they will use to sign in. This access key is used as the card id for the member to make transactions and query records. The member once signed in, can make transactions to earn points and redeem points from the partners on the network. They can view their transactions as part of the blockchain ledger. This code pattern illustrates the use of permissions as part of the network where a member can only view their transactions.

Similarly for the partner, they will register by creating an identity on the network and an access key which will be used to view their records. Partners are allowed to view only transactions they were part of, and thus can keep track of all their transactions where they allocated or redeemed points. The web application shows a basic dashboard for the partner displaying the total points that they have allocated and redeemed to members. As transactions get complex, the partner can perform analysis on their transactions to create informative dashboards.


## Architecture Flow

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/72646158-7367dc80-3943-11ea-8d9e-63f79367b95a.png">
</p>

**Note** The blockchain network will have multiple members and partners

1. Member is registered on the network
2. Member can sign-in to make transactions to earn points, redeem points and view their transactions
3. Partner is registered on the network
4. Partner can sign-in to view their transactions and display dashboard

## Featured technology
+ [Hyperledger Fabric v2.2](https://hyperledger-fabric.readthedocs.io) is a platform for distributed ledger solutions, underpinned by a modular architecture that delivers high degrees of confidentiality, resiliency, flexibility, and scalability.
+ [Node.js](https://nodejs.org/en/) is an open source, cross-platform JavaScript run-time environment that executes server-side JavaScript code.
+ [Express.js](https://expressjs.com/) is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
+ [Bootstrap](https://getbootstrap.com/) Bootstrap is an open source toolkit for developing with HTML, CSS, and JS.


## Running the application locally

Follow these steps to set up and run this code pattern.


### Prerequisites

You had to complete the task from [Hyperledger Fabric document](https://hyperledger-fabric.readthedocs.io/en/release-2.2/install.html):


### Steps
1. [Clone the repo](#1-clone-the-repo)
2. [Setup network locally and deploy the smart contract](#3-setup-network-locally-and-deploy-the-smart-contract)
3. [Run the application](#4-run-the-application)


#### 1. Clone the repo

Clone this repository in a folder your choice:

```bash
git clone https://github.com/tuan072090/customer-loyalty-program-hyperledger-fabric-VSCode.git
cd customer-loyalty-program-hyperledger-fabric-VSCode
```

#### 2. Setup network locally and deploy the smart contract
Open new terminal tab at "fabric-samples" folder that you download in [Prerequisites](#prerequisites) then start a test network with ca 
```
cd test-network/
./network.sh up createChannel -c meete-channel -ca
```

#### 4. Run the application

* #### Enroll admin

  - First, navigate to the `web-app` directory, and install the node dependencies.
    ```bash
    cd web-app/
    npm install
    ```

  - Run the `enrollAdmin.js` script
    ```bash
    node enrollAdmin.js
    ```

  - You should see the following in the terminal:
    ```bash
    msg: Successfully enrolled admin user app-admin and imported it into the wallet
    ```

* #### Run the application server

  - From the `web-app` directory, start the server.

    ```bash
    npm start
    ```

You can find the app running at http://localhost:8000/

<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/72647296-3bae6400-3946-11ea-9998-80c5f8c5a82c.png">
</p>
<br>


## Links
* [Hyperledger Fabric Docs](http://hyperledger-fabric.readthedocs.io/en/latest/)
* [IBM Code Patterns for Blockchain](https://developer.ibm.com/patterns/category/blockchain/)


## License
This code pattern is licensed under the Apache Software License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
