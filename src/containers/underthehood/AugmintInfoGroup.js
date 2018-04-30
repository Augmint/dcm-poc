import React from "react";
import { connect } from "react-redux";
import augmintTokenProvider from "modules/augmintTokenProvider";

import { AugmintTokenInfo } from "./components/AugmintTokenInfo";
import { FeeAccountInfo } from "./components/FeeAccountInfo";
import { MonetarySupervisorInfo } from "./components/MonetarySupervisorInfo";
import { Pgrid } from "components/PageLayout";

class BaseInfoGroup extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
    }

    render() {
        return (
            <Pgrid columns={3}>
                <Pgrid.Column>
                    <AugmintTokenInfo contractData={this.props.augmintTokenData} contract={this.props.augmintToken} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <FeeAccountInfo
                        contractData={this.props.augmintTokenData.info.feeAccount}
                        contract={this.props.feeAccount}
                    />
                </Pgrid.Column>
                <Pgrid.Column>
                    <MonetarySupervisorInfo
                        contractData={this.props.monetarySupervisorData}
                        contract={this.props.monetarySupervisor}
                    />
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintTokenData: state.augmintToken,
    augmintToken: state.contracts.latest.augmintToken,
    monetarySupervisorData: state.monetarySupervisor,
    monetarySupervisor: state.contracts.latest.monetarySupervisor,
    feeAccount: state.contracts.latest.feeAccount,
    userBalances: state.userBalances,
    accounts: state.web3Connect.accounts
});

export default connect(mapStateToProps)(BaseInfoGroup);
