import React from "react";
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
  Modal,
} from "react-bootstrap";
import { RedeemButton } from "./RedeemButton";

export const WalkTokenDetails = (props) => {
  const [modalShow, setModalShow] = React.useState(false);

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
                  <Card.Text className="tokenFluctuation">+ 10 WT
                  </Card.Text>
                  <Card.Text className="walkTokenCount">
                    3415
                  </Card.Text>
                  <Card.Text className="usdConversion">
                  = XYZ USD
                  </Card.Text>
                  <Row>
                    <Col>
                    <Container style={{display: "flex", justifyContent: "center", alignItems: "center" }} React Center>
                    <Button style = {{fontSize: 14}}>Shop Marketplace</Button> &nbsp;&nbsp;&nbsp;
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
                    <Tabs className="justify-content-center" defaultActiveKey="Home" 
                          id="controlled-tab-example">
                        <Tab eventKey="Home" title="Home" className="tabColor">
                          <div style={{ marginTop: `12px` }}>
                              <Table striped bordered hover>
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>First Name</th>
                                      <th>Last Name</th>
                                      <th>Username</th>
                                    </tr>
                                  </thead>
                                  <tbody >
                                    <tr>
                                      <td>1</td>
                                      <td>Mark</td>
                                      <td>Otto</td>
                                      <td>@mdo</td>
                                    </tr>
                                    <tr>
                                      <td>2</td>
                                      <td>Jacob</td>
                                      <td>Thornton</td>
                                      <td>@fat</td>
                                    </tr>
                                    <tr>
                                      <td>3</td>
                                      <td colSpan="2">Larry the Bird</td>
                                      <td>@twitter</td>
                                    </tr>
                                  </tbody>
                              </Table>
                          </div>
                        </Tab>
                        <Tab eventKey="profile" title="Profile" className="tabColor">
                        <div style={{ marginTop: `12px` }}>
                              <Table striped bordered hover>
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>zFirst Name</th>
                                      <th>zLast Name</th>
                                      <th>zUsername</th>
                                    </tr>
                                  </thead>
                                  <tbody >
                                    <tr>
                                      <td>1</td>
                                      <td>Mark</td>
                                      <td>Otto</td>
                                      <td>@mdo</td>
                                    </tr>
                                    <tr>
                                      <td>2</td>
                                      <td>Jacob</td>
                                      <td>Thornton</td>
                                      <td>@fat</td>
                                    </tr>
                                    <tr>
                                      <td>3</td>
                                      <td colSpan="2">Larry the Bird</td>
                                      <td>@twitter</td>
                                    </tr>
                                  </tbody>
                              </Table>
                          </div>
                        </Tab>
                        <Tab eventKey="contact" title="Contact" className="tabColor">
                        <div style={{ marginTop: `12px` }}>
                              <Table striped bordered hover>
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>xFirst Name</th>
                                      <th>xLast Name</th>
                                      <th>xUsername</th>
                                    </tr>
                                  </thead>
                                  <tbody >
                                    <tr>
                                      <td>1</td>
                                      <td>Mark</td>
                                      <td>Otto</td>
                                      <td>@mdo</td>
                                    </tr>
                                    <tr>
                                      <td>2</td>
                                      <td>Jacob</td>
                                      <td>Thornton</td>
                                      <td>@fat</td>
                                    </tr>
                                    <tr>
                                      <td>3</td>
                                      <td colSpan="2">Larry the Bird</td>
                                      <td>@twitter</td>
                                    </tr>
                                  </tbody>
                              </Table>
                          </div>
                        </Tab>
                    </Tabs>                    
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <br></br>

    </div>
  );
};
