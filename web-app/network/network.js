'use strict';

const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');

// capture network variables from config.json
const configPath = path.join(process.cwd(), 'config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
let connection_file = config.connection_file;
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;
let gatewayDiscovery = config.gatewayDiscovery;

const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

//export module
module.exports = {

    /*
  * Create Member participant and import card for identity
  * @param {String} cardId Import card id for member
  * @param {String} accountNumber Member account number as identifier on network
  * @param {String} firstName Member first name
  * @param {String} lastName Member last name
  * @param {String} phoneNumber Member phone number
  * @param {String} email Member email
  */
    registerMember: async function (cardId, accountNumber, firstName, lastName, email, phoneNumber) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {

            let response = {};


            // Check to see if we've already enrolled the user.
            const userExists = await wallet.get(cardId);
            if (userExists) {
                let err = `An identity for the user ${cardId} already exists in the wallet`;
                console.log(err);
                response.error = err;
                return response;
            }

            // Create a new CA client for interacting with the CA.
            const caInfo = ccp.certificateAuthorities['ca.org1.example.com']; //lookup CA details from config
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Check to see if we've already enrolled the admin user.
            const adminIdentity = await wallet.get(appAdmin);
            if (!adminIdentity) {
                let err = 'An identity for the admin user-admin does not exist in the wallet. Run the enrollAdmin.js application before retrying';
                console.log(err);
                response.error = err;
                return response;
            }

            // build a user object for authenticating with the CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            // Register the user, enroll the user, and import the new identity into the wallet.
            // if affiliation is specified by client, the affiliation value must be configured in CA
            const secret = await caClient.register({
                affiliation: 'org1.department1',
                enrollmentID: cardId,
                role: 'client'
            }, adminUser);
            const enrollment = await caClient.enroll({
                enrollmentID: cardId,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: orgMSPID,
                type: 'X.509',
            };
            await wallet.put(cardId, x509Identity);
            console.log(`Successfully registered and enrolled user ${cardId} and imported it into the wallet`);

        } catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }
        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            let member = {};
            member.accountNumber = accountNumber;
            member.firstName = firstName;
            member.lastName = lastName;
            member.email = email;
            member.phoneNumber = phoneNumber;
            member.points = 0;

            // Submit the specified transaction.
            console.log('\nSubmit Create Member transaction.');
            const createMemberResponse = await contract.submitTransaction('CreateMember', JSON.stringify(member));
            console.log('createMemberResponse: ');
            console.log(JSON.parse(createMemberResponse.toString()));

            console.log('\nGet member state ');
            const memberResponse = await contract.evaluateTransaction('GetState', accountNumber);
            console.log('memberResponse.parse_response: ');
            console.log(JSON.parse(memberResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Create Partner participant and import card for identity
  * @param {String} cardId Import card id for partner
  * @param {String} partnerId Partner Id as identifier on network
  * @param {String} name Partner name
  */
    registerPartner: async function (cardId, partnerId, name) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {

            let response = {};


            // Check to see if we've already enrolled the user.
            const userExists = await wallet.get(cardId);
            if (userExists) {
                let err = `An identity for the user ${cardId} already exists in the wallet`;
                console.log(err);
                response.error = err;
                return response;
            }

            // Create a new CA client for interacting with the CA.
            const caInfo = ccp.certificateAuthorities['ca.org1.example.com']; //lookup CA details from config
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

            // Check to see if we've already enrolled the admin user.
            const adminIdentity = await wallet.get(appAdmin);
            if (!adminIdentity) {
                let err = 'An identity for the admin user-admin does not exist in the wallet. Run the enrollAdmin.js application before retrying';
                console.log(err);
                response.error = err;
                return response;
            }

            // build a user object for authenticating with the CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            // Register the user, enroll the user, and import the new identity into the wallet.
            // if affiliation is specified by client, the affiliation value must be configured in CA
            const secret = await caClient.register({
                affiliation: 'org1.department1',
                enrollmentID: cardId,
                role: 'client'
            }, adminUser);
            const enrollment = await caClient.enroll({
                enrollmentID: cardId,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: orgMSPID,
                type: 'X.509',
            };
            await wallet.put(cardId, x509Identity);
            console.log(`Successfully registered and enrolled user ${cardId} and imported it into the wallet`);

        } catch (err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }
        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, {
                wallet, identity: cardId,
                discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
            });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            // console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
            // await contract.submitTransaction('instantiate');
            // console.log('*** Result: committed');
            let partner = {};
            partner.id = partnerId;
            partner.name = name;

            // Submit the specified transaction.
            console.log('\nSubmit Create Partner transaction.');
            const createPartnerResponse = await contract.submitTransaction('CreatePartner', JSON.stringify(partner));
            console.log('createPartnerResponse: ', createPartnerResponse);

            console.log('\nGet partner state ');
            const partnerResponse = await contract.evaluateTransaction('GetState', partnerId);
            console.log('partnerResponse.parse_response: ', partnerResponse);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Perform EarnPoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {String} partnerId Partner Id of partner
  * @param {Integer} points Points value
  */
    earnPointsTransaction: async function (cardId, accountNumber, partnerId, points) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            let earnPoints = {};
            earnPoints.points = points;
            earnPoints.member = accountNumber;
            earnPoints.partner = partnerId;

            // Submit the specified transaction.
            console.log('\nSubmit EarnPoints transaction.');
            const earnPointsResponse = await contract.submitTransaction('EarnPoints', JSON.stringify(earnPoints));
            console.log('earnPointsResponse: ');
            console.log(JSON.parse(earnPointsResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Perform UsePoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {String} partnerId Partner Id of partner
  * @param {Integer} points Points value
  */
    usePointsTransaction: async function (cardId, accountNumber, partnerId, points) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            let usePoints = {};
            usePoints.points = points;
            usePoints.member = accountNumber;
            usePoints.partner = partnerId;

            // Submit the specified transaction.
            console.log('\nSubmit UsePoints transaction.');
            const usePointsResponse = await contract.submitTransaction('UsePoints', JSON.stringify(usePoints));
            console.log('usePointsResponse: ');
            console.log(JSON.parse(usePointsResponse.toString()));

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return true;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get Member data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  */
    memberData: async function (cardId, accountNumber) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            console.log('\nGet member state ');
            let member = await contract.submitTransaction('GetState', accountNumber);
            member = JSON.parse(member.toString());
            console.log(member);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return member;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get Partner data
  * @param {String} cardId Card id to connect to network
  * @param {String} partnerId Partner Id of partner
  */
    partnerData: async function (cardId, partnerId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            let partner = await contract.submitTransaction('GetState', partnerId);
            partner = JSON.parse(partner.toString());
            console.log(partner);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return partner;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get all partners data
  * @param {String} cardId Card id to connect to network
  */
    allPartnersInfo : async function (cardId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            console.log('\nGet all partners state ');
            let allPartners = await contract.evaluateTransaction('GetState', 'all-partners');
            allPartners = JSON.parse(allPartners.toString());
            console.log(allPartners);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return allPartners;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }
    },

    /*
  * Get all EarnPoints transactions data
  * @param {String} cardId Card id to connect to network
  */
    earnPointsTransactionsInfo: async function (cardId, userType, userId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            console.log(`\nGet earn points transactions state for ${userType} ${userId}`);
            let earnPointsTransactions = await contract.evaluateTransaction('EarnPointsTransactionsInfo', userType, userId);
            earnPointsTransactions = JSON.parse(earnPointsTransactions.toString());
            console.log(earnPointsTransactions);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return earnPointsTransactions;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    },

    /*
  * Get all UsePoints transactions data
  * @param {String} cardId Card id to connect to network
  */
    usePointsTransactionsInfo: async function (cardId, userType, userId) {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), '/wallet');
        const wallet =  await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway2 = new Gateway();
            await gateway2.connect(ccp, { wallet, identity: cardId, discovery: gatewayDiscovery });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway2.getNetwork('meete-channel');

            // Get the contract from the network.
            const contract = network.getContract('loyalty');

            console.log(`\nGet use points transactions state for ${userType} ${userId}`);
            let usePointsTransactions = await contract.evaluateTransaction('UsePointsTransactionsInfo', userType, userId);
            usePointsTransactions = JSON.parse(usePointsTransactions.toString());
            console.log(usePointsTransactions);

            // Disconnect from the gateway.
            await gateway2.disconnect();

            return usePointsTransactions;
        }
        catch(err) {
            //print and return error
            console.log(err);
            let error = {};
            error.error = err.message;
            return error;
        }

    }

};
