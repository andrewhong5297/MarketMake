import React from "react";

import { Navbar, Nav, Button, Container } from "react-bootstrap";
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

  const pet_response = await fetch(url, otherParam)
    .then((data) => {
      return data.json();
    })
    .then((res) => {
      return res.data.walks;
    });
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

  const pet_response = await fetch(url, otherParam)
    .then((data) => {
      return data.json();
    })
    .then((res) => {
      return res.data.walks;
    });
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
    projectId: "faefe1dcd6094fb388019173d2328d8f",
    projectSecret: "dffad28934914b97a5365fa0c2eb9de6"
  });

  //contracts
  let walkExchange = new ethers.Contract(
    "0x536fe3510Ab895c93f02D1803a7cd0602Dcd8E43",
    abiWTE,
    mainnetProvider
  );

  let walkToken = new ethers.Contract(
    "0x4bc20d3da2a0e56a75225FDF2878f130854D31d1",
    abiWT,
    mainnetProvider
  );

  let walkBadge = new ethers.Contract(
    "0xd3A5F01d67555921aecb9544fc963ab435859690",
    abiWB,
    mainnetProvider
  );

  return (
    <div
      style={{
        backgroundImage: `url("https://i.pinimg.com/564x/77/ad/6c/77ad6c7c8b25b1929ee48420665db07b.jpg")`,
      }}
    >
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">
          <span role="img" aria-label="doge">
            🐕
          </span>{" "}
          FidoByte
        </Navbar.Brand>
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
        <br></br>
        <WalkTokenDetails
          infura={mainnetProvider}
          provider={provider}
          walkExchange={walkExchange}
          walkToken={walkToken}
          walkBadge={walkBadge}
        />
        <br></br>
        <RankingDataTable
          onFetch={() => getSpecificWalkerData()}
          onFetchAll={() => getAllWalkerData()}
        />
      </Container>
    </div>
  );
}

export default App;
