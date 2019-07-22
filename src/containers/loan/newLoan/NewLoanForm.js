/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */
/* eslint-disable import/first */

import React from "react";
import moment from "moment";
import Button from "components/augmint-ui/button";
import { EthSubmissionErrorPanel, ErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import { Form, Validations, Normalizations, Formatters } from "components/BaseComponents";
import { AEUR, ETH } from "components/augmint-ui/currencies.js";
import styled from "styled-components";
import { connect } from "react-redux";

import theme from "styles/theme";
import { ETHEUR } from "utils/constants";
import { Wei, Tokens, Ratio } from "@augmint/js";

const StyledBox = styled.div`
    border-radius: 3px;
    box-sizing: border-box;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    background: rgba(232, 232, 232, 0.3);

    text-align: center;
    font-size: 14px;
    line-height: 200%;
    color: rgba(0, 0, 0, 0.7);

    & .box-val {
        display: block;
        color: black;
        font-size: 22px;
        font-weight: 800;
        margin-bottom: -4px;
        & .symbol {
            font-size: 14px;
            font-weight: 400;
        }
    }
    &.validation-error {
        border: 2px solid ${theme.colors.darkRed};
        background-color: ${theme.colors.lightRed};
        margin-bottom: 0;
        & .box-val {
            color: ${theme.colors.darkRed};
        }
    }
`;

const COL_RATIO = 0.9; // TODO

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.products = this.props.loanManager.products;
        this.activeProducts = this.props.loanManager.products
            .filter(product => product.isActive)
            .sort((p1, p2) => p2.termInSecs - p1.termInSecs);

        const defaultProduct = this.activeProducts[0];

        this.state = {
            product: defaultProduct,
            minToken: Validations.minTokenAmount(defaultProduct.minDisbursedAmount),
            maxLoanAmount: Validations.maxLoanAmount(defaultProduct.maxLoanAmount),
            repaymentAmount: Tokens.of(0),
            ethAmount: Wei.of(0),
            loanTokenAmount: Tokens.of(0),
            productId: this.activeProducts[0].id,
            repayBefore: null,
            interestAmount: null
        };
    }

    componentDidMount() {
        this.setProduct(); // needed when landing from Link within App
        this.props.change("productId", `${this.state.product.id}_${this.state.product.loanManagerAddress}`);
        this.props.change("product", this.state.product);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.products !== this.props.products) {
            this.setProduct(); // needed when landing from on URL directly
        }

        if (
            prevProps.loanForm &&
            prevProps.loanForm.values &&
            this.props.loanForm &&
            this.state.product &&
            this.props.rates
        ) {
            const prevToken = prevProps.loanForm.values.loanTokenAmount;
            const token = this.props.loanForm.values.loanTokenAmount;
            const prevProductId = prevProps.loanForm.values.productId;
            const productId = this.props.loanForm.values.productId;

            if (token !== prevToken) {
                this.onLoanTokenAmountChange(token);
            }
            if (productId !== prevProductId) {
                this.onSelectedLoanChange(productId);
            }
        }
    }

    setProduct() {
        // workaround b/c landing directly on URL and from LoanSelector triggers different events.
        if (this.props.products == null) {
            return;
        } // not loaded yet
        let product = this.props.products[this.state.productId];
        this.setState({ isLoading: false, product: product });
    }

    updateMinRate() {
        const ethFiat = Tokens.of(this.props.rates.info.ethFiatRate);
        const minRate = ethFiat.mul(Ratio.of(COL_RATIO));

        if (minRate !== this.state.minRate) {
            this.setState({ minRate: minRate });
            this.props.change("minRate", minRate);
        }

        return minRate;
    }

    onLoanTokenAmountChange(token) {
        const amount = token ? token : this.props.loanForm.values.loanTokenAmount || Tokens.of(0);
        const ethFiat = Tokens.of(this.props.rates.info.ethFiatRate);
        const result = this.state.product.calculateLoanFromDisbursedAmount(amount, ethFiat);

        this.props.change("ethAmount", result.collateralAmount);

        this.setState({
            ethAmount: result.collateralAmount,
            loanTokenAmount: amount,
            repaymentAmount: result.repaymentAmount,
            repayBefore: result.repayBefore,
            interestAmount: result.interestAmount
        });

        this.updateMinRate();
    }

    ethValidationError() {
        let balance = this.props.userBalances;
        if (!balance.isLoading && this.state.ethAmount) {
            const ethBalance = Wei.of(balance.account.ethBalance);
            return this.state.ethAmount.gte(ethBalance);
        }
    }

    onSelectedLoanChange(id) {
        const [productId, loanManagerAddress] = id.split("_");
        const product = this.products.find(
            item => item.id === parseInt(productId) && item.loanManagerAddress === loanManagerAddress
        );
        this.props.change("product", product);
        this.setState(
            {
                productId: id,
                product: product,
                minToken: Validations.minTokenAmount(product.minDisbursedAmount),
                maxLoanAmount: Validations.maxLoanAmount(product.maxLoanAmount),
                marginLoan: product.isMarginLoan
            },
            () => {
                this.onLoanTokenAmountChange();
            }
        );

        this.updateMinRate();
    }

    render() {
        const { error, handleSubmit, submitting, clearSubmitErrors, loanManager, onSubmit } = this.props;
        const isRatesAvailable = this.props.rates && this.props.rates.info.bn_ethFiatRate * 1 > 0;
        const repayBefore = this.state.repayBefore ? moment(this.state.repayBefore).format("D MMM YYYY") : null;
        const interestRate = Math.round(this.state.product.interestRatePa * 10000) / 100;
        const showResults = this.state.repaymentAmount ? !!this.state.repaymentAmount.toNumber() : false;

        const notEnoughEth = this.ethValidationError();
        const isDesktop = window.innerWidth > 768;

        return (
            <div>
                {error && (
                    <EthSubmissionErrorPanel
                        error={error}
                        header="Create loan failed"
                        onDismiss={() => clearSubmitErrors()}
                    />
                )}
                {!isRatesAvailable && (
                    <ErrorPanel>
                        No {ETHEUR} rates available. `Can't` get a loan at the moment. Try agin later
                    </ErrorPanel>
                )}{" "}
                {isRatesAvailable && (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <StyledBox>
                            Get a new crypto-backed loan at
                            <div className="box-val">
                                {`${interestRate}% `}
                                <span className="symbol">per year (APR)</span>
                            </div>
                        </StyledBox>

                        <label>How much would you like to borrow?</label>
                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            name="loanTokenAmount"
                            type="number"
                            inputmode="numeric"
                            step="any"
                            min="0"
                            disabled={submitting || !loanManager.isLoaded}
                            validate={[
                                Validations.required,
                                Validations.tokenAmount,
                                this.state.maxLoanAmount,
                                this.state.minToken
                            ]}
                            parse={Normalizations.toToken}
                            format={Formatters.fromToken}
                            data-testid="loanTokenAmountInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="A-EUR"
                            autoFocus={isDesktop}
                        />

                        {this.state.productId !== null && this.state.productId !== undefined && (
                            <Field
                                component={Form.Field}
                                name="productId"
                                disabled={submitting || !loanManager.isLoaded}
                                data-testid="loan-product-selector"
                                className="field-big"
                                isSelect={true}
                                isLoan={true}
                                selectOptions={this.activeProducts}
                                selectTestId="loan-product"
                                id={"selectedLoanProduct-" + this.state.productId}
                                onBlur={e => {
                                    console.debug(e);
                                    return;
                                }}
                            />
                        )}

                        {this.state.marginLoan && (
                            <div style={{ textAlign: "center" }}>
                                <h3 style={{ marginBottom: 0 }}>This is a margin loan</h3>
                                <p>Margin rate: {this.state.minRate ? this.state.minRate.toNumber() : "?"}</p>
                            </div>
                        )}

                        {showResults && (
                            <div className="loan-results">
                                <StyledBox className={notEnoughEth ? "validation-error" : ""}>
                                    You will need to transfer
                                    <ETH
                                        className="box-val"
                                        data-testid="ethAmount"
                                        amount={this.state.ethAmount.toNumber()}
                                    />
                                    as collateral to secure this loan.
                                </StyledBox>
                                {notEnoughEth && (
                                    <p style={{ color: theme.colors.darkRed, margin: "0 0 20px 0" }}>
                                        You don't have enough ETH
                                    </p>
                                )}

                                <div>
                                    <p style={{ marginTop: 0, marginBottom: 20, lineHeight: 1.5, textAlign: "center" }}>
                                        {"Repay "}
                                        <AEUR
                                            data-testid="repaymentAmount"
                                            style={{ fontWeight: 800 }}
                                            amount={this.state.repaymentAmount}
                                        />
                                        {" by "}
                                        <strong>{repayBefore}</strong>
                                        <br />
                                        {"to get your "}
                                        <ETH amount={this.state.ethAmount} />
                                        {" collateral back."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ width: "100%", textAlign: "center" }}>
                            <Button
                                size="big"
                                data-testid="submitBtn"
                                loading={submitting}
                                disabled={notEnoughEth || !this.state.loanTokenAmount}
                                type="submit"
                                className={"fullwidth"}
                            >
                                {submitting ? "Submitting..." : "Get loan"}
                            </Button>
                        </div>
                    </Form>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    userBalances: state.userBalances,
    loanForm: state.form.NewLoanForm
});

NewLoanForm = reduxForm({
    form: "NewLoanForm",
    touchOnBlur: false,
    touchOnChange: true
})(NewLoanForm);
export default connect(mapStateToProps)(NewLoanForm);
