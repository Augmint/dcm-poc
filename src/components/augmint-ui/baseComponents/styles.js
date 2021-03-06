import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

export const StyledContainer = styled.div`
    display: flex;
    width: 100%;
    justify-content: flex-start;

    &.oneLine,
    &.oneLine input {
        width: auto;
    }

    &.error {
        margin: 0 0 5px;
    }

    & label {
        font-size: ${remCalc(16)};
        font-weight: 400;
        line-height: ${remCalc(20)};
    }

    & input,
    & input::placeholder {
        font-size: 22px;
        color: ${theme.colors.primary};
        font-weight: 600;
    }
    & input.small-text,
    & input.small-text::placeholder {
        font-size: 10px;
        color: ${theme.colors.opacLighterGrey};
    }
`;

export const StyledInput = styled.input`
    border: 1px solid ${theme.colors.opacGrey};
    border-radius: ${theme.borderRadius.all};
    border-right: none;
    padding: ${remCalc(0)} ${remCalc(16)};
    max-width: 100%;
    min-width: 50%;
    outline: none;
    font-size: 24px;
    height: 60px;
    box-sizing: border-box;
    flex-grow: 1;
`;

export const StyledSelect = styled.select`
    border: 1px solid ${theme.colors.opacGrey};
    border-radius: 3px;
    width: 100%;
    outline: none;
    background-color: white;
    font-size: 22px;
    color: ${theme.colors.primary};
    font-weight: 600;
    height: 60px;
    text-indent: 10px;
    appearance: menulist !important;
`;

export const StyledLabel = styled.label`
    font-size: 16px;
    line-height: ${remCalc(20)};
`;

export const StyledError = styled.span`
    color: ${theme.colors.darkRed};
    display: inline-block;
    margin: 0 0 5px;
`;

export const StyledFormField = styled.div`
    margin: 0 0 ${remCalc(22)};
    & input.nolabel {
        border-right: 1px solid ${theme.colors.opacGrey};
    }
    &.error {
        color: ${theme.colors.darkRed};

        & input {
            background-color: ${theme.colors.lightRed};
            border: 2px solid ${theme.colors.darkRed};
            color: ${theme.colors.darkRed};
        }
    }
`;

export const StyledStatusBox = styled.div`
    margin: 0;
    padding: 20px;
    border: 1px solid ${theme.colors.grey};
    font-family: ${theme.typography.fontFamilies.title};
    font-size: ${remCalc(14)};
    color: ${theme.colors.mediumGrey};

    .danger &,
    &.danger {
        background: ${theme.colors.red};
        border-color: ${theme.colors.red};
        color: ${theme.colors.white};
    }

    .warning &,
    &.warning {
        border-color: ${theme.colors.red};
        color: ${theme.colors.red};
    }

    .ReadyToRelease &,
    &.ReadyToRelease {
        background: ${theme.colors.white};
        border-color: ${theme.colors.green};
        color: ${theme.colors.green};
    }

    .margin-loan & {
        font-size: ${remCalc(12)};
    }
`;

export const StyledStatusText = styled.p`
    font-size: ${remCalc(14)};

    .warning &,
    .danger &,
    &.warning,
    &.danger {
        color: ${theme.colors.red};
    }
`;
