import React from "react";
import { connect } from "react-redux";
import { Pgrid, Pheader, Psegment } from "components/PageLayout";
import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";
import AddWithdrawForm from "./components/AddWithdrawForm";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";

import "./styles.css";

class WithdrawHome extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
        ratesProvider();
    }

    render() {
        const { userAccount, rates } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Exchange Fiat" />
                    </TopNavTitlePortal>

                    <Pgrid id="funding">
                        <Pgrid.Row className="row">
                            <Pgrid.Column className="column" size={{ mobile: 1, tablet: 1, desktop: 2 / 5 }}>
                                <AddWithdrawForm user={userAccount} rates={rates} />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    userAccount: state.userBalances.account,
    rates: state.rates
});

export default connect(mapStateToProps)(WithdrawHome);
