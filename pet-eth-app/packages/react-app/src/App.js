import React from "react";

import {
  Navbar,
  Nav,
  Button,
  Container,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import useWeb3Modal from "./hooks/useWeb3Modal";

import { ethers } from "ethers";
import * as Realm from "realm-web";

import { WalkTokenDetails } from "./components/WalkTokenDetails";
import { RankingDataTable } from "./components/RankingDataTable";

const fetch = require("node-fetch");
const { abi: abiWTE } = require("./abis/WalkTokenExchange.json");
const { abi: abiWT } = require("./abis/WalkToken.json");
const { abi: abiWB } = require("./abis/WalkBadgeOracle.json");

async function getSpecificWalkerData(name) {
  const app = new Realm.App("petproject-sfwui");
  await app.logIn(Realm.Credentials.emailPassword("test@gmail.com", "test123"));
  const url =
    "https://realm.mongodb.com/api/client/v2.0/app/petproject-sfwui/graphql";
  const query = JSON.stringify({
    query: `
      query {
          walks (query: {Walker_Name: "${name}"}, sortBy: UNIX_TIMESTAMP_DESC) {
              Distance_Walked
              Dog_Name
              Time_Walked
              UNIX_Timestamp
              Walker_Address
              Walker_Name
              _id
          }
        }`,
  });

  const otherParam = {
    headers: {
      Authorization: `Bearer ${app.currentUser.accessToken}`,
    },
    body: query,
    method: "POST",
  };

  const pet_response = await fetch(url, otherParam).then((data) => {
    return data.json();
  }).then(res=>{return res.data.walks});
  return await pet_response;
}

async function getAllWalkerData() {
  const app = new Realm.App("petproject-sfwui");
  await app.logIn(Realm.Credentials.emailPassword("test@gmail.com", "test123"));
  const url =
    "https://realm.mongodb.com/api/client/v2.0/app/petproject-sfwui/graphql";
  const query = JSON.stringify({
    query: `
      query {
          walks (sortBy: UNIX_TIMESTAMP_DESC) {
              Distance_Walked
              Dog_Name
              Time_Walked
              UNIX_Timestamp
              Walker_Address
              Walker_Name
              _id
          }
        }`,
  });

  const otherParam = {
    headers: {
      Authorization: `Bearer ${app.currentUser.accessToken}`,
    },
    body: query,
    method: "POST",
  };

  const pet_response = await fetch(url, otherParam).then((data) => {
    return data.json();
  }).then(res=>{return res.data.walks});
  return await pet_response;
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      style={{ display: "flex", justifyContent: "flex-end" }}
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const mainnetProvider = new ethers.providers.InfuraProvider("kovan", {
    projectId: "d635ea6eddda4720824cc8b24380e4a9",
    projectSecret: "b4ea2b15f0614105a64f0e8ba1f2bffa"
  });

  //contracts
  let walkExchange = new ethers.Contract(
    "0x90b709e2bdf140c5D4bFD7A1f046572ce9f2845f",
    abiWTE,
    mainnetProvider
  );

  let walkToken = new ethers.Contract(
    "0x649c200De35dc9990dB3ac49aC8Ed2237053aA35",
    abiWT,
    mainnetProvider
  );

  let walkBadge = new ethers.Contract(
    "0x1b5B99dEff7D8dc9e57D51F3fCF2CAa127B60d2D",
    abiWB,
    mainnetProvider
  );

  return (
    <div style={{ 
      backgroundImage: `url("https://i.pinimg.com/564x/77/ad/6c/77ad6c7c8b25b1929ee48420665db07b.jpg")`}}>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">FidoByte</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="https://youtube.com">Pitch Video</Nav.Link>
            <Nav.Link href="https://hack.ethglobal.co/marketmake/teams/rechblh1Znn8U0uzU/recpnc2Ir529X7aJI">
              MarketMake Profile Link
            </Nav.Link>
          </Nav>
          <WalletButton
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
        </Navbar.Collapse>
      </Navbar>
      <Container>
        <WalkTokenDetails
          infura={mainnetProvider}
          provider={provider}
          walkExchange={walkExchange}
          walkToken={walkToken}
          walkBadge={walkBadge}
        />
        <br></br>
        <RankingDataTable 
          onFetch={()=>getSpecificWalkerData()}
          onFetchAll={()=>getAllWalkerData()}
        />
      </Container>
    </div>
  );
}

export default App;
