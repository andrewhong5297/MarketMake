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
    const [usdAmount, setUSD] = useState("0");
    const [data, setData] = useState();
    const [modalShow, setModalShow] = useState(false);

    const reduceTwoDecimalsBI = (BigIntString) => {
      let returnV = BigIntString.slice(0,-16)
      const numberLen = returnV.length
      returnV = returnV.slice(0,numberLen-2) + "." + returnV.slice(numberLen-2,numberLen)
      return returnV
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {          
        const owner = props.provider.getSigner();
        const balance = await props.walkToken.connect(owner).balanceOf("0xa55E01a40557fAB9d87F993d8f5344f1b2408072");
        // await props.walkBadge.connect(burner).getBadge("0xa55E01a40557fAB9d87F993d8f5344f1b2408072")
        setBalance(reduceTwoDecimalsBI(balance.toString()));
      } catch (e) {
        setError(e)
        }
        setLoading(false)
        setError(null)
    }

    const fetchGraphData = async () => {
      setGraphLoading(true);
      try {          
        const response = await getGraphTransfers("0xa55E01a40557fAB9d87F993d8f5344f1b2408072")
        console.log(response)
        setData(response);
      } catch (e) {
        setError(e)
        }
        setGraphLoading(false)
        setError(null)
    }

    //this affects sign of transaction shown
    const checkActionType = () => {if(data[0]["action"]=="Walk Pay") {
      return "+" + reduceTwoDecimalsBI(data[0].value)
    }
    else {
      return "-" + reduceTwoDecimalsBI(data[0].value)
    }}

    //need claim tokens button (request oracle call)
    //need create and upgrade badge buttons (in marketplace)

    //update all data when provider loads in
    useEffect(() => {
    fetchBalance()
    fetchGraphData()
    }, [props.provider])

    //update USD balance
    useEffect(() => {
      setUSD((parseInt(balance)/100).toString())
    }, [balance])

  return (
    <div>
      <br></br>
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
                  <Card.Text className="tokenFluctuation">
                                {
                                  isGraphLoading
                                  ? <Spinner animation="border" variant="dark" />
                                  : checkActionType()
                                }
                  </Card.Text>
                  <Card.Text className="walkTokenCount">
                      {
                      isLoading
                      ? <Spinner animation="border" variant="dark" />
                      : 
                      <div>{balance} WT</div>
                      }
                  </Card.Text>
                  <Card.Text className="usdConversion">
                  ${usdAmount}
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
                                      <td id={index}>{row["Date"]}</td>
                                      <td id={index}>{row["Action"]}</td>
                                      <td id={index}>{row["Amount"]}</td>
                                      <td id={index}>{row["Etherscan"]}</td>
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
