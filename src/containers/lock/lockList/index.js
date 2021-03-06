import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { Psegment, Pheader } from "components/PageLayout";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import Segment from "components/augmint-ui/segment";
import { Menu } from "components/augmint-ui/menu";
import { NoItems } from "components/augmint-ui/list";
import Button from "components/augmint-ui/button";
import { ErrorPanel } from "components/MsgPanels";
import LockCard from "./LockCard";
import NewLock from "./../newLock";

import "./styles.css";

function LockList(props) {
    const { location } = props;
    const { isLoading, error, locks } = props.locks;
    const isActivePage = location.pathname === "/lock";
    const isNewLock = location.pathname === "/lock/new";

    const listItems =
        locks &&
        locks
            .filter(lock => lock.isActive === isActivePage)
            .sort((a, b) => {
                return isActivePage ? a.lockedUntil - b.lockedUntil : b.lockedUntil - a.lockedUntil;
            })
            .map(lock => <LockCard key={`lock-${lock.id}`} lock={lock} />);

    let content = null;
    if (isNewLock) {
        content = <NewLock />;
    } else {
        content = listItems;
    }

    return (
        <Psegment id="locks-segment">
            <TopNavTitlePortal>
                <Pheader header="My locks" />
            </TopNavTitlePortal>

            <Segment className="block locks-block">
                <Menu>
                    <Menu.Item data-testid="newLockLink" exact to="/lock/new" activeClassName="active">
                        New lock
                    </Menu.Item>
                    <Menu.Item exact to="/lock" activeClassName="active">
                        Active locks
                    </Menu.Item>
                    <Menu.Item exact to="/lock/archive" activeClassName="active">
                        Old locks
                    </Menu.Item>
                </Menu>

                <div className={isLoading ? "loading" : ""}>
                    {error && <ErrorPanel header="Error while fetching lock list">{error.message}</ErrorPanel>}
                    {listItems && listItems.length === 0 && !isNewLock ? (
                        <NoItems title={isActivePage ? "You have no active locks." : "You have no old locks."}>
                            <div style={{ margin: "30px 0" }}>
                                <p>
                                    <strong>Earn premium by locking your A-EUR.</strong>
                                </p>
                            </div>
                        </NoItems>
                    ) : (
                        <div>{content}</div>
                    )}
                    {!isNewLock && (
                        <div style={{ textAlign: "center" }}>
                            <Button style={{ marginLeft: "auto" }} to="/lock/new" data-testid="newLockLinkbtn">
                                Lock A-EUR
                            </Button>
                        </div>
                    )}
                </div>
            </Segment>
        </Psegment>
    );
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    locks: state.locks
});

export default withRouter(connect(mapStateToProps)(LockList));
