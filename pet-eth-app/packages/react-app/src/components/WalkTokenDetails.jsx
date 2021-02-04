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
        <Card>
          <Card.Body>
            <div class="container">
              <div class="row">
                <div class="col-md">
                  <Row>
                    <Col>
                      <Card.Title>Total Walk Tokens (WT)</Card.Title>
                    </Col>
                  </Row>
                  <Card.Text>
                    <h6>+ 10 WT</h6>
                  </Card.Text>
                  <Card.Text>
                    <h1>3415</h1>
                  </Card.Text>
                  <Card.Text>
                    <h6>= XYZ USD</h6>
                  </Card.Text>
                  <Row>
                    <Col>
                      <Button>Shop Marketplace</Button>
                      <Button
                        onClick={() => setModalShow(true)}
                        variant="secondary"
                      >
                        Redeem USD
                      </Button>
                      <RedeemButton
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        provider={props.provider}
                        walkExchange={props.walkExchange}
                        walkToken={props.walkToken}
                      />
                    </Col>
                  </Row>
                </div>

                <div class="col-md">
                    <Tabs className="justify-content-center" defaultActiveKey="Home" 
                          id="controlled-tab-example">
                        <Tab eventKey="home" title="Home">
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
                                  <tbody>
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
                        <Tab eventKey="profile" title="Profile">
                        </Tab>
                        <Tab eventKey="contact" title="Contact" disabled>
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
