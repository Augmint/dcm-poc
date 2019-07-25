/* TODO:
 -  make confirmation through flash notification (so we don't need to keep it open while tx processing)
 - confirmation modal closes if there is an order / ordefill / cancel event in the background. We need to  handle
        it's b/c we reload the whole order book on newOrder / orderfill events. It's planned to maintan orderbook
        state on client which will resolve this issue.
*/
import React from "react";
import { connect } from "react-redux";

import store from "modules/store";
import { sendAndProcessTx } from "modules/ethereum/ethHelper";

import Button from "components/augmint-ui/button";
import Icon from "components/augmint-ui/icon";
import Header from "components/augmint-ui/header";
import Modal from "components/augmint-ui/modal";
import { EthSubmissionErrorPanel } from "components/MsgPanels";
import { Validations } from "components/BaseComponents";
import { StyledInput, StyledError, StyledContainer } from "components/augmint-ui/baseComponents/styles";
import { StyleLabel } from "components/augmint-ui/FormCustomLabel/styles";

import { Wei } from "@augmint/js";

import theme from "styles/theme";

class AddCollateralButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            popupOpen: false,
            submitting: false,
            error: null,
            result: null,
            ethAmount: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(e) {
        const value = e.target.value;

        const ethAmountError = Validations.ethAmount(value);
        const ethBalaceError = Validations.ethUserBalance(value);
        const error = [ethAmountError, ethBalaceError].find(i => !!i);

        this.setState({
            ethAmount: value,
            error
        });
    }

    async handleSubmit() {
        const { loan, userAccount } = this.props;

        this.setState({
            submitting: true
        });

        try {
            const tx = await store
                .getState()
                .web3Connect.augmint.addExtraCollateral(loan, Wei.of(this.state.ethAmount), userAccount);

            const transactionHash = await sendAndProcessTx(tx, "AddExtraCollateral");

            this.handleClose();

            return transactionHash;
        } catch {
            this.setState({ submitting: false, transactionError: true });
        }
    }

    handleClose() {
        this.setState({
            error: null,
            popupOpen: false
        });
    }

    render() {
        const { submitting, error, popupOpen, transactionError } = this.state;

        return (
            <div style={{ display: "block" }}>
                <Button
                    data-testid={`addCollateralButton`}
                    onClick={() => {
                        this.setState({ popupOpen: true });
                        return false;
                    }}
                >
                    Add extra collateral
                </Button>
                {this.state.popupOpen && (
                    <Modal
                        size="small"
                        open={popupOpen}
                        closeOnDimmerClick={false}
                        onClose={this.handleClose}
                        onCloseRequest={this.handleClose}
                    >
                        <Header
                            content="Add extra collateral to your loan"
                            className="opacLightGrey"
                            style={{
                                borderBottom: "1px solid",
                                borderBottomColor: theme.colors.opacGrey,
                                padding: "20px",
                                margin: 0
                            }}
                        />

                        <Modal.Content>
                            {transactionError && (
                                <EthSubmissionErrorPanel
                                    onDismiss={() => {
                                        this.setState({ transactionError: null });
                                    }}
                                    error={transactionError}
                                    header="Transaction failed."
                                />
                            )}
                            <form onSubmit={this.handleSubmit}>
                                <StyledContainer style={{ maxWidth: 280 }}>
                                    <StyledInput
                                        type="number"
                                        inputmode="numeric"
                                        name="addCollateralAmount"
                                        disabled={submitting}
                                        data-testid="addCollateralAmountInput"
                                        onChange={this.onInputChange}
                                        placeholder="0"
                                        style={{ border: error && "1px solid #9f3a38" }}
                                    />
                                    <StyleLabel align="right">ETH</StyleLabel>
                                </StyledContainer>
                                <StyledError>{error}</StyledError>
                            </form>
                        </Modal.Content>

                        <Modal.Actions style={{ paddingTop: 0 }}>
                            <Button className="grey" onClick={this.handleClose} style={{ marginTop: "10px" }}>
                                <Icon name="close" style={{ marginRight: "6px" }} />
                                Close
                            </Button>

                            <Button
                                data-testid={`ConfirmExtraCollateral`}
                                id={`ConfirmExtraCollateral`}
                                onClick={this.handleSubmit}
                                content={submitting ? "Submitting..." : "Add collateral"}
                                style={{ marginTop: "10px", marginLeft: "10px" }}
                                disabled={error || submitting}
                            />
                        </Modal.Actions>
                    </Modal>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.exchange.isLoading,
    userAccount: state.web3Connect.userAccount
});

export default connect(mapStateToProps)(AddCollateralButton);
