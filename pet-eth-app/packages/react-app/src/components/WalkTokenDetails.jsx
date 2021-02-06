import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import {
  Container,
  Row,
  Col,
  Button,
  Tab,
  Tabs,
  Card,
  Table,
  Spinner
} from "react-bootstrap";
import { RedeemButton } from "./RedeemButton";
import { ethers } from "ethers";
const fetch = require("node-fetch");

//https://api.thegraph.com/subgraphs/name/andrewhong5297/walktokentransfers get actions by address
async function getGraphTransfers(address) {
  const url =
    "https://api.thegraph.com/subgraphs/name/andrewhong5297/walktokentransfers";
  const query = JSON.stringify({
    query: `
      query {
          transfers(where: {from: "${address.toLowerCase()}"}) {
            id
            from
            action
            value
            createdAt
          }
        }`,
  });

  const otherParam = {
    body: query,
    method: "POST",
  };

  const pet_response = await fetch(url, otherParam).then((data) => {
    return data.json();
  }).then(res=>{return res.data.transfers});
  return await pet_response;
}

export const WalkTokenDetails = (props) => {
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isGraphLoading, setGraphLoading] = useState(true);
    const [balance, setBalance] = useState();
    const [data, setData] = useState();
    const [modalShow, setModalShow] = useState(false);

    const fetchData = async () => {
      // start showing spinner
      setLoading(true);
      try {          
        
        // let statusCheck = props.provider
        // while(statusCheck==undefined){
        //   console.log("loading provider...")
        //   statusCheck = props.provider
        // }
        // const owner = props.provider.getSigner();
        // const balance = await props.walkToken.connect(owner).balanceOf("0xa55E01a40557fAB9d87F993d8f5344f1b2408072");
        // await props.walkBadge.connect(burner).getBadge("0xa55E01a40557fAB9d87F993d8f5344f1b2408072")
        // console.log(balance.toString())
        // setBalance(balance.toString());
      } catch (e) {
        setError(e)
        }
        // hide spinner and show error or data
        setLoading(false)
        setError(null)
    }

    const fetchGraphData = async () => {
      // start showing spinner
      setGraphLoading(true);
      try {          
        const response = await getGraphTransfers("0xa55E01a40557fAB9d87F993d8f5344f1b2408072")
        console.log(response)
        setData(response);
      } catch (e) {
        setError(e)
        }
        // hide spinner and show error or data
        setGraphLoading(false)
        setError(null)
    }

    useEffect(() => {
    // fetchData()
    fetchGraphData()
    }, [])

  return (
    <div>
      <br></br>
      <Button onClick={fetchData} >transfer WT</Button>
        <Card>
          <Card.Body className="customCard">
            <div class="container">
              <div class="row">
                <div class="col-md">
                  <Row>
                    <Col>
                      <Card.Title className="customCardTitle">Total Walk Tokens (WT)</Card.Title>
                    </Col>
                  </Row>
                  <Card.Text className="tokenFluctuation">+ 10 WT
                  </Card.Text>
                  <Card.Text className="walkTokenCount">
                      {
                      isLoading
                      ? <Spinner animation="border" variant="dark" />
                      : 
                      <div>{balance}</div>
                      }
                  </Card.Text>
                  <Card.Text className="usdConversion">
                  = XYZ USD
                  </Card.Text>
                  <Row>
                    <Col>
                    <Container style={{display: "flex", justifyContent: "center", alignItems: "center" }} React Center>
                    <Button style = {{fontSize: 14}}>Claim Tokens</Button> &nbsp;&nbsp;&nbsp;
                      <Button style = {{fontSize: 14}}
                        onClick={() => setModalShow(true)}
                        variant="secondary"
                      >
                        Redeem USD
                      </Button >
                      <RedeemButton
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        provider={props.provider}
                        walkExchange={props.walkExchange}
                        walkToken={props.walkToken}
                      />
                    </Container>
                    </Col>
                  </Row>
                </div>

                <div class="col-md">
                    <Tabs className="justify-content-center" defaultActiveKey="Transactions" 
                          id="controlled-tab-example">
                        <Tab eventKey="Transactions" title="Transactions" className="tabColor">
                          <div style={{ marginTop: `12px` }}>
                              <Table striped bordered hover>
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Action</th>
                                      <th>Amount</th>
                                      <th>Etherscan</th>
                                    </tr>
                                  </thead>
                                  {
                                  isGraphLoading
                                  ? <Spinner animation="border" variant="dark" />
                                  : 
                                  <tbody>
                                    {data.map((row, index) => (
                                    <tr id={index}>
                                      <td id={index}>{row["createdAt"]}</td>
                                      <td id={index}>{row["action"]}</td>
                                      <td id={index}>{row["value"]}</td>
                                      <td id={index}>{row["id"]}</td>
                                    </tr>
                                ))}
                                </tbody>
                                  }
                              </Table>
                          </div>
                        </Tab>
                        <Tab eventKey="Marketplace" title="Marketplace" className="tabColor">
                          <div style={{ marginTop: `12px` }}>
                            <Button>buy things</Button>
                            <Button>redeem new Badge</Button>
                          </div>
                        </Tab>
                    </Tabs>                    
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
    </div>
  );
};
