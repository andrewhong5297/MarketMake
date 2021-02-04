import React, { useState, Component } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Button, Alert, Modal } from "react-bootstrap"

export const RedeemButton = (props) => {

    const { register, handleSubmit } = useForm();
    const [error, setError] = useState()

    const buyOne = async (formData) => {
        const overrides = {
            gasLimit: ethers.BigNumber.from("1000000"),
          };
          
        const owner = props.provider.getSigner();
        try {

            // console.log((parseInt(formData.value)*(10**20)).toLocaleString('fullwide', {useGrouping:false}))
            //10**20 instead of 10**18 because of conversion rate
            const approve = await props.walkToken.connect(owner).approve(props.walkExchange.address,ethers.BigNumber.from((parseInt(formData.value)*(10**20)).toLocaleString('fullwide', {useGrouping:false})),overrides);
            // await approve.wait(3)
            console.log(approve)
            const redeemed = await props.walkExchange.connect(owner).redeemWTforDai(ethers.BigNumber.from((parseInt(formData.value)*(10**18)).toLocaleString('fullwide', {useGrouping:false})), overrides);
            // await redeemed.wait(3)
            console.log(redeemed)

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
                        Looks like that didn't go through - make sure you have already selected a project and have enough funds in your wallet.
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
                            Modal heading
                          </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <form onSubmit={handleSubmit(buyOne)}>
                                    <label>
                                    How much Dai to redeem (100 WalkTokens for 1 Dai)?   :  
                                    <input type="text" name="value" ref={register} />
                                    </label>
                                    {/* <label>
                                    :    Fund project for how many years?   :
                                    <input type="text" name="year" ref={register} />
                                    </label> */}
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
