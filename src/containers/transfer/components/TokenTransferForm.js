/*
TODO: form client side validation. eg:
    - address checksum and format check
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { connect } from "react-redux";
import { reduxForm, SubmissionError, Field } from "redux-form";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { Form, Validations, Normalizations, Parsers } from "components/BaseComponents";
import { getTransferFee } from "modules/ethereum/transferTransactions";
import { transferToken, TOKEN_TRANSFER_SUCCESS } from "modules/reducers/augmintToken";
import { TransferFeeToolTip } from "./AccountToolTips";
import theme from "styles/theme";
import { transferTokenDelegated } from "modules/reducers/augmintTx";
import { setupTopicWatch, startRepeating } from "modules/augmintTxProvider";

class TokenTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null,
            feeAmount: "0",
            urlResolved: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
        this.setFeeByAmount = this.setFeeByAmount.bind(this);
    }

    componentDidMount() {
        setupTopicWatch();
        startRepeating();
    }

    componentDidUpdate() {
        if (!this.state.urlResolved && this.props.augmintToken.isLoaded) {
            const { blur } = this.props;
            const urlParams = new URL(document.location).searchParams;
            const addressFromParam = urlParams.get("address");
            const amountFromParam = urlParams.get("amount");
            const referenceFromParam = urlParams.get("reference");

            if (amountFromParam !== null) {
                blur("tokenAmount", amountFromParam);
                this.setFeeByAmount(amountFromParam);
            }

            if (addressFromParam !== null) {
                blur("payee", addressFromParam);
            }

            if (referenceFromParam !== null) {
                blur("narrative", referenceFromParam);
            }

            this.setState({ urlResolved: true });
        }
    }

    onTokenAmountChange(e) {
        let amount;
        try {
            amount = parseFloat(e.target.value);
        } catch (error) {
            return;
        }
        this.setFeeByAmount(amount);
    }

    setFeeByAmount(amount) {
        const fee = getTransferFee(amount);
        this.setState({ feeAmount: fee });
    }

    async handleSubmit(values) {
        const delegated = this.props.delegated || false;
        if (!delegated) {
            await this.handleSubmitWithETH(values);
        } else {
            await this.handleSubmitWithAugmintTx(values);
        }
    }

    async handleSubmitWithAugmintTx(values) {
        const tokenAmount = parseFloat(values.tokenAmount);
        const result = await store.dispatch(
            transferTokenDelegated({
                amount: tokenAmount,
                to: values.payee,
                narrative: values.narrative,
                maxExecutorFee: values.delegatedTransferFee
            })
        );
        this.setState({
            result,
            to: values.payee,
            tokenAmount,
            feeAmount: values.delegatedTransferFee
        });
    }

    async handleSubmitWithETH(values) {
        const tokenAmount = parseFloat(values.tokenAmount);
        const res = await store.dispatch(
            transferToken({
                payee: values.payee,
                tokenAmount,
                narrative: values.narrative
            })
        );
        if (res.type !== TOKEN_TRANSFER_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result,
                to: values.payee,
                tokenAmount,
                feeAmount: "0"
            });
        }
    }

    render() {
        const {
            error,
            handleSubmit,
            pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset,
            augmintToken,
            isFunctional,
            submitText,
            delegated
        } = this.props;

        return (
            <div style={isFunctional && { display: "inline" }}>
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Token transfer submitted"
                        result={this.state.result}
                        onDismiss={() => reset()}
                    >
                        <p>
                            Transfer {this.state.tokenAmount} A-EUR to {this.state.to}
                        </p>
                    </EthSubmissionSuccessPanel>
                )}
                {!submitSucceeded && (
                    <Form
                        error={error ? "true" : "false"}
                        onSubmit={handleSubmit(this.handleSubmit)}
                        style={isFunctional && { display: "inline" }}
                    >
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Transfer failed"
                                onDismiss={() => {
                                    clearSubmitErrors();
                                }}
                            />
                        )}

                        {!isFunctional && (
                            <div>
                                <Field
                                    component={Form.Field}
                                    as={Form.Input}
                                    type={isFunctional ? "hidden" : "number"}
                                    inputmode="numeric"
                                    step="any"
                                    min="0"
                                    name="tokenAmount"
                                    placeholder="Amount"
                                    onChange={this.onTokenAmountChange}
                                    validate={[
                                        Validations.required,
                                        Validations.tokenAmount,
                                        Validations.userTokenBalanceWithTransferFee
                                    ]}
                                    normalize={Normalizations.twoDecimals}
                                    disabled={submitting || !augmintToken.isLoaded}
                                    data-testid="transferAmountInput"
                                    style={{ borderRadius: theme.borderRadius.left }}
                                    labelAlignRight="A-EUR"
                                />
                                {delegated ? (
                                    <Field
                                        component={Form.Field}
                                        as={Form.Input}
                                        label="Transfer fee:"
                                        size="small"
                                        data-testid="delegatedTransferFee"
                                        name="delegatedTransferFee"
                                        type={isFunctional ? "hidden" : "text"}
                                        parse={Parsers.trim}
                                        validate={[Validations.required, Validations.tokenAmount]}
                                        placeholder="0.1"
                                        disabled={submitting || !augmintToken.isLoaded}
                                    />
                                ) : (
                                    (augmintToken.info.feeMax !== 0 ||
                                        augmintToken.info.feeMin !== 0 ||
                                        augmintToken.info.feePt !== 0) && (
                                        <small style={{ display: "block", marginBottom: 10 }}>
                                            Fee: <span data-testid="transferFeeAmount">{this.state.feeAmount}</span> A€{" "}
                                            <TransferFeeToolTip augmintTokenInfo={augmintToken.info} />
                                        </small>
                                    )
                                )}

                                <Field
                                    component={Form.Field}
                                    as={Form.Input}
                                    label="To:"
                                    size="small"
                                    data-testid="transferToAddressField"
                                    name="payee"
                                    type={isFunctional ? "hidden" : "text"}
                                    parse={Parsers.trim}
                                    validate={[Validations.required, Validations.address, Validations.notOwnAddress]}
                                    placeholder="0x0..."
                                    disabled={submitting || !augmintToken.isLoaded}
                                />
                                <Field
                                    component={Form.Field}
                                    as={Form.Input}
                                    data-testid="transferNarrativeField"
                                    label="Reference:"
                                    name="narrative"
                                    type={isFunctional ? "hidden" : "text"}
                                    placeholder="short narrative (optional)"
                                    disabled={submitting || !augmintToken.isLoaded}
                                />
                            </div>
                        )}
                        <Button
                            type="submit"
                            loading={submitting}
                            disabled={!isFunctional && pristine}
                            data-testid="submitTransferButton"
                            className={submitting ? "loading" : ""}
                        >
                            {submitting ? "Submitting..." : submitText || "Transfer"}
                        </Button>
                    </Form>
                )}
            </div>
        );
    }
}

TokenTransferForm.defaultProps = {
    delegated: false
};

const mapStateToProps = state => ({
    augmintToken: state.augmintToken,
    tokenBalance: state.userBalances.account.tokenBalance,
    userAccount: state.web3Connect.userAccount,
    web3: state.web3Connect.web3Instance
});

TokenTransferForm = connect(mapStateToProps)(TokenTransferForm);

export default reduxForm({
    form: "TokenTransferForm"
})(TokenTransferForm);
