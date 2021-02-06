import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Button, Alert, Modal } from "react-bootstrap"

export const RedeemModal = (props) => {

    const { register, handleSubmit } = useForm();
    const [error, setError] = useState()

    const buyOne = async (formData) => {
        const overrides = {
            gasLimit: ethers.BigNumber.from("1000000"),
          };
          
        const owner = props.provider.getSigner();
        try {
            // const address = await owner.getAddress();
            // console.log(address)

            //10**20 instead of 10**18 because of conversion rate
            const approve = await props.walkToken.connect(owner).approve(props.walkExchange.address,ethers.BigNumber.from((parseInt(formData.value)*(10**20)).toLocaleString('fullwide', {useGrouping:false})),overrides);
            const redeemed = await props.walkExchange.connect(owner).redeemWTforDai(ethers.BigNumber.from((parseInt(formData.value)*(10**18)).toLocaleString('fullwide', {useGrouping:false})), overrides);
            await redeemed.wait(3)

            setError(
                <Alert variant="success" onClose={() => setError(null)} dismissible>
                    <Alert.Heading>Transaction went through, Dai recieved!</Alert.Heading>
                </Alert>
            )     
         }
         catch(e) {
            console.error(e)
            setError(
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        <Alert.Heading>Transaction Error</Alert.Heading>
                        <p>
                        Looks like that didn't go through - make sure you have enough Walk Tokens in your wallet.
                        </p>
                    </Alert>
                ) 
            }
        }

        return ( 
            <div>
                <Modal
                        {...props}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                      >
                        <Modal.Header closeButton>
                          <Modal.Title id="contained-modal-title-vcenter">
                            Get paid 1 Dai for every 100 Walk Tokens 
                          </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <form onSubmit={handleSubmit(buyOne)}>
                                    <label>
                                    How much Dai do you want to redeem?     
                                    <input type="text" name="value" ref={register} />
                                    </label>
                                    <input type="submit" value="Submit" />
                                    {error}
                                </form>
                            </Modal.Body>
                        <Modal.Footer>
                          <Button onClick={props.onHide}>Close</Button>
                        </Modal.Footer>
                      </Modal>
            </div>
         );
    }
