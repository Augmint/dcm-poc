import React from "react";

import { Pblock } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupColumn as Col, MyGridTable } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/toolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import CancelOrderButton from "./CancelOrderButton";
import BigNumber from "bignumber.js";

import { TOKEN_SELL, TOKEN_BUY } from "modules/reducers/orders";
import { DECIMALS, ETHEUR } from "utils/constants";
import { floatNumberConverter } from "utils/converter";
import { AEUR, ETH } from "components/augmint-ui/currencies";

const OrderItem = props => {
    const { order, ethFiatRate } = props;

    const bn_ethFiatRate = ethFiatRate !== null && new BigNumber(ethFiatRate);

    const displayPrice = floatNumberConverter(order.price, DECIMALS).toFixed(2);

    const actualValue =
        order.direction === TOKEN_SELL
            ? (order.amount * order.price) / bn_ethFiatRate
            : (bn_ethFiatRate / order.price) * order.amount;

    return (
        <Row valign="top">
            <Col width={2}>{order.direction === TOKEN_SELL ? "Sell A€" : "Buy A€"}</Col>

            <Col width={3}>
                {order.direction === TOKEN_BUY && <ETH amount={order.amount} />}
                {order.direction === TOKEN_SELL && <ETH amount={actualValue} />}
            </Col>

            <Col width={3}>
                {order.direction === TOKEN_SELL && <AEUR amount={order.amount} />}
                {order.direction === TOKEN_BUY && <AEUR amount={actualValue} />}
            </Col>

            <Col width={2}>{displayPrice}%</Col>

            <Col width={2}>
                <MoreInfoTip id={"my_order_more_info-" + order.id}>
                    {order.direction === TOKEN_SELL && (
                        <p>
                            Sell A€ order: <br />
                            {order.amount} A€ @{displayPrice}% of current {ETHEUR} = <br />
                            {order.amount} A€ * {order.price} €/A€ / {ethFiatRate} {ETHEUR} = <br />
                            {actualValue} ETH
                        </p>
                    )}
                    {order.direction === TOKEN_BUY && (
                        <p>
                            Buy A€ Order: <br />
                            {order.amount} ETH @{displayPrice}% of current {ETHEUR} = <br />
                            {order.amount} ETH * {ethFiatRate} {ETHEUR} / {order.price} €/A€ = <br />
                            {actualValue} A€
                        </p>
                    )}
                    Maker: {order.maker}
                    <br />
                    Order Id: {order.id}
                </MoreInfoTip>

                <CancelOrderButton order={order} />
            </Col>
        </Row>
    );
};

const OrderList = props => {
    const { myOrders, ethFiatRate } = props;

    const itemList = [];

    for (let i = 0; i < myOrders.length; i++) {
        itemList.push(<OrderItem order={myOrders[i]} ethFiatRate={ethFiatRate} key={`ordersRow-${myOrders[i].id}`} />);
    }

    return (
        itemList.length > 0 && (
            <MyListGroup>
                <Row wrap={false} halign="center" valign="top">
                    <Col width={2} />

                    <Col width={3}>
                        <strong>ETH Amount</strong>
                    </Col>

                    <Col width={3}>
                        <strong>A€ Amount</strong>
                    </Col>

                    <Col width={2}>
                        <strong>Price</strong> <PriceToolTip id={"myOrders"} />
                    </Col>

                    <Col width={2} />
                </Row>

                {itemList}
            </MyListGroup>
        )
    );
};

export default class OrderBook extends React.Component {
    render() {
        const { header, userAccountAddress, testid } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        const { ethFiatRate } = this.props.rates.info;

        const buyOrders =
            orders == null
                ? []
                : orders.buyOrders.filter(order => order.maker.toLowerCase() === userAccountAddress.toLowerCase());
        const sellOrders =
            orders == null
                ? []
                : orders.sellOrders.filter(order => order.maker.toLowerCase() === userAccountAddress.toLowerCase());
        const myOrders = [...buyOrders, ...sellOrders].sort((o1, o2) => o2.id - o1.id);

        const totalBuyAmount = orders
            ? parseFloat(buyOrders.reduce((sum, order) => order.bn_ethAmount.add(sum), 0).toFixed(6))
            : "?";
        const totalSellAmount = orders ? sellOrders.reduce((sum, order) => order.amount + sum, 0).toFixed(2) : "?";

        return (
            <Pblock loading={isLoading} header={header} data-testid={testid}>
                {refreshError && <ErrorPanel header="Error while fetching orders">{refreshError.message}</ErrorPanel>}
                {orders == null && !isLoading && <p>Connecting...</p>}
                <p>
                    Total: <strong>{totalBuyAmount} ETH </strong>Buy Order + <strong>{totalSellAmount} A€</strong> Sell
                    Order
                </p>
                {isLoading ? (
                    <p>Refreshing orders...</p>
                ) : (
                    <MyGridTable>
                        <OrderList
                            myOrders={myOrders}
                            ethFiatRate={ethFiatRate}
                            userAccountAddress={userAccountAddress}
                        />
                    </MyGridTable>
                )}
            </Pblock>
        );
    }
}

OrderBook.defaultProps = {
    orders: null,
    userAccountAddress: null,
    header: <h3>Open orders</h3>
};
