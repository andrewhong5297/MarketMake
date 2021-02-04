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
    <div className="App">
      <header className="App-header">
        <Card style={{ width: "50rem", color: "#000" }}>
          <Card.Body>
            <div class="container">
              <div class="row">
                <div class="col-sm">
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

                <div>
                  <Tabs
                    defaultActiveKey="profile"
                    id="uncontrolled-tab-example"
                    style={{ color: "#000" }}
                    className="justify-content-end"
                  >
                    <Tab
                      className="customCard"
                      eventKey="walktokens"
                      title="Walk Tokens"
                    >
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
                    </Tab>
                    <Tab eventKey="duration" title="Duration"></Tab>
                    <Tab eventKey="distance" title="Distance"></Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </header>
    </div>
  );
};
