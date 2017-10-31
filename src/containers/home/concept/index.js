import React from "react";
import { Tsegment, Tblock } from "components/TextContent";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";

export default () => (
    <Tsegment header="Digital Credit Money" subheader="Concept">
        <Tblock header="Modern money">
            <p>
                Modern currencies are credit based. In layman's terms the amount
                of money in circulation (supply) is automatically adjusted by
                market participants (i.e. banks). Banks are creating money when
                issuing loans and burning money when a loan is repaid.
            </p>
            <p>
                The stability is secured or fortified by central banks,
                adjusting certain base parameters and by the market via the
                banks adjusting their loan conditions.
            </p>
            <p>
                This system has its flaws and it can be corrupted by governments
                and banks but in general that's how the monetary system ensures
                there is always as much money available in the economy as
                needed.
            </p>
        </Tblock>
        <Tblock header="DCM tokens">
            <p>
                DCM is built on the concept of automatically adjusting the
                supply of each DCM token in a similar way as modern fiat money
                but in a transparent, decentralised and secure fashion.
            </p>
            <p>
                DCM tokens are only issued when a new, collateral based loan is
                created. Tokens are burnt on repayment. In case of loan default
                the collateral goes to DCM stability reserves, managed by smart
                contracts. It all happens in an automated, cryptographically
                secure and decentralised way.{" "}
            </p>
            <p>
                Parameters for the new loans, the use of the reserves for market
                interventions are decided by transparent and open governance
                processes.
            </p>
            <p>
                UCD is the first DCM token to be implemented. UCD will be pegged
                to USD.
            </p>
        </Tblock>
        <Tblock header="Price stability">
            <p>
                There are multiple mechanisms to ensure the market expectation
                and the actual price is around parity to the pegged currency.
            </p>
            <Tblock.SubHeader header="Market mechanics" />
            <p>
                The primary foundation of stability is the continuous supply of
                DCM tokens via loan originations and a corresponding demand for
                paying back loans on maturity.
            </p>
            <p>
                Further specific features of the DCM system will work towards
                maintaining stability by smoothing the demand & supply peaks and
                troughs.
            </p>
            <Tblock.SubHeader header="Loan parameters" />
            <p>
                If UCD price deviating from parity then loan parameters are
                adjusted to make it more or less compelling to get UCD loan for
                a certain digital asset. This has an effect on UCD
                demand/supply.
            </p>
            <Tblock.SubHeader header="Market intervention" />
            <p>
                DCM can intervene from its reserves accumulated from fees,
                defaults and interests. DCM reserves can be used on held only
                for market intervention.
            </p>
            <p>
                Check out our white paper for additional tools and more
                scenarios.
            </p>
        </Tblock>
        <Tblock header="Getting UCD">
            <p>
                You can always buy or sell your UCD for cryptocurrencies (ETH,
                BTC etc.) on a decentralised exchange. Secondary exchanges will
                offer direct fiat conversions to/from UCD as well. As the DCM
                ecosystem grows you will need less and less to exchange DCM
                tokens to fiat money.
            </p>
            <Tblock.SubHeader>UCD loans</Tblock.SubHeader>
            <p>
                You can also get UCD by putting your digital assets (ETH or BTC
                at the beginning) into a decentralised escrow contract.
            </p>
        </Tblock>
        <Tblock header="Governance">
            <p>
                The fundamental rules, agreements and funds are maintained and
                enforced by smart contracts - cryptographically immutable
                algorithms running on the blockchain.
            </p>
            <p>
                We aim to handle as many "decisions" as possible with smart
                contracts but it's not feasible to prepare for every case with
                automated smart contracts, such as financial parameters, trusted
                price oracles, new digital assets, contract releases.
            </p>
            <p>
                These decisions are made by stakeholders - governance token
                (GDC) holders. DCMs governance model ensures that all decisions
                are democratic and transparent.
            </p>
            <p>
                Access to GDC is open to anyone who is willing to deposit UCD
                tokens. To incentify holding and voting with GDCs the profit
                from fees is distributed among GDC holders.
            </p>
        </Tblock>

        <Tsegment.Row centered columns={1}>
            <Tsegment.Column textAlign="center">
                <Button
                    content="Try it"
                    as={Link}
                    to="/tryit"
                    icon="right chevron"
                    labelPosition="right"
                    primary
                    size="huge"
                />
            </Tsegment.Column>
        </Tsegment.Row>
        <Tsegment.Row centered columns={1}>
            <Tsegment.Column textAlign="center">
                <Button
                    content="Work in progress white paper"
                    as={Link}
                    to="http://bit.ly/augmint-wp"
                    target="_blank"
                    icon="file text outline"
                    labelPosition="left"
                    size="large"
                />
            </Tsegment.Column>
        </Tsegment.Row>
    </Tsegment>
);
