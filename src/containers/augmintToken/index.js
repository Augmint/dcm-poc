import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import metricsProvider from "modules/metricsProvider";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { ReserveStats } from "./components/ReserveStats";
import { TotalSupply } from "./components/TotalSupply";
import { LtdStats } from "./components/LtdStats";
import { EarningStats } from "./components/EarningStats";
import { EthereumState } from "containers/app/EthereumState";
import Button from "components/augmint-ui/button";

import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

class AugmintToken extends React.Component {
    componentDidMount() {
        connectWeb3();
        ratesProvider();
        augmintTokenProvider();
        loanManagerProvider();
        lockManagerProvider();
        metricsProvider();
    }

    handleAugmintTokenRefreshClick = e => {
        e.preventDefault();
        this.props.refreshAugmintToken();
    };

    render() {
        console.log(this.props.loanManager);
        return (
            <EthereumState>
                <div style={{ color: "black" }}>
                    <h1>Total Supply: {this.props.augmintToken.info.totalSupply}</h1>
                    <h1>
                        Issued by Stability Board (Net): {this.props.monetarySupervisor.info.issuedByStabilityBoard}
                    </h1>
                    <h1>ETH Fees: {this.props.augmintToken.info.feeAccountEthBalance}</h1>
                    <h1>A-EUR FEE:{this.props.augmintToken.info.feeAccountTokenBalance}</h1>
                    <h1>Collateral in escrow:{this.props.loanManager.info.ethBalance}</h1>
                    <br />
                    <h1>ltdPercent: {this.props.monetarySupervisor.info.ltdPercent}</h1>
                    <h1>maxLoanByLtd: {this.props.monetarySupervisor.info.maxLoanByLtd}</h1>
                    <h1>maxLockByLtd: {this.props.monetarySupervisor.info.maxLockByLtd}</h1>
                    <h1>reserveEthBalance: {this.props.monetarySupervisor.info.reserveEthBalance}</h1>
                    <h1>reserveTokenBalance: {this.props.monetarySupervisor.info.reserveTokenBalance}</h1>
                    <h1>totalLoanAmount: {this.props.monetarySupervisor.info.totalLoanAmount}</h1>
                    <h1>totalLockedAmount: {this.props.monetarySupervisor.info.totalLockedAmount}</h1>
                </div>
                <Psegment style={{ padding: "2em 1em" }}>
                    <TopNavTitlePortal>
                        <Pheader className="secondaryColor" header="Reserves" />
                    </TopNavTitlePortal>
                    <Pgrid.Row>
                        <Pgrid.Column style={{ padding: 0 }}>
                            <TotalSupply
                                augmintToken={this.props.augmintToken}
                                monetarySupervisor={this.props.monetarySupervisor}
                            />
                        </Pgrid.Column>
                        <Pgrid.Column style={{ padding: 0 }}>
                            <ReserveStats
                                augmintToken={this.props.augmintToken}
                                monetarySupervisor={this.props.monetarySupervisor}
                                rates={this.props.rates}
                            />
                        </Pgrid.Column>

                        <Pheader header="Loans & Locks" className={"primaryColor"} style={{ width: "100%" }} />
                        <Pgrid.Column style={{ padding: 0 }}>
                            <LtdStats
                                monetarySupervisor={this.props.monetarySupervisor}
                                loanManager={this.props.loanManager}
                                lockManager={this.props.lockManager}
                            />
                            <Button
                                content="Loans to Collect"
                                data-testid="loansToCollectButton"
                                to="/loan/collect"
                                icon="angle-right"
                                labelposition="right"
                                size="large"
                                style={{ marginBottom: "15px" }}
                            />
                        </Pgrid.Column>

                        <Pheader
                            header="Earnings"
                            className={"primaryColor"}
                            style={{ marginTop: "1em", width: "100%" }}
                        />
                        <Pgrid.Column style={{ padding: 0 }}>
                            <EarningStats
                                monetarySupervisor={this.props.monetarySupervisor}
                                augmintToken={this.props.augmintToken}
                            />
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    augmintToken: state.augmintToken,
    loanManager: state.loanManager,
    lockManager: state.lockManager,
    monetarySupervisor: state.monetarySupervisor,
    rates: state.rates
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            refreshAugmintToken
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AugmintToken);
