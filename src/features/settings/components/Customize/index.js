// @flow

import React, { Fragment } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Field, change } from 'redux-form';
import styles from './styles';
import {
    CtButton,
    DefaultLayout,
    InputField,
    ToggleSwitch,
    CtDivider,
    Tabs,
} from '../../../../components';
import { ROUTES } from '../../../../navigation/routes';
import { CUSTOMIZE_FORM, CUSTOMIZE_TYPE, PAYMENT_TABS } from '../../constants';
import Lng from '../../../../api/lang/i18n';
import { goBack, MOUNT, UNMOUNT } from '../../../../navigation/actions';
import { headerTitle } from '../../../../api/helper';
import { PaymentModes } from './PaymentModes'
import { Units } from './Units';
import { hasObjectLength } from '../../../../api/global';

type IProps = {
    navigation: Object,
    formValues: Object,
    language: String,
    type: String,
    loading: Boolean,
    isLoading: Boolean,
    handleSubmit: Function,
}

export class Customize extends React.Component<IProps> {
    constructor(props) {
        super(props);

        this.paymentChild = React.createRef();
        this.itemChild = React.createRef();

        this.state = {
            data: {},
            isUpdateAutoGenerate: false,
            activeTab: PAYMENT_TABS.MODE,
        }
    }

    componentDidMount() {

        const {
            getCustomizeSettings,
            customizes,
            navigation,
        } = this.props

        let hasCustomizeApiCalled = customizes ? (typeof customizes === 'undefined' || customizes === null) : true

        hasCustomizeApiCalled && getCustomizeSettings()

        this.setState({ data: this.setParams() })

        goBack(MOUNT, navigation)
    }

    componentWillUpdate(nextProps, nextState) {

        const { navigation } = nextProps
        const toastMsg = navigation.getParam('toastMsg', null)

        toastMsg &&
            setTimeout(() => {
                navigation.setParams({ 'toastMsg': null })
            }, 2500);
    }

    componentWillUnmount() {
        this.state.isUpdateAutoGenerate &&
            this.props.setCustomizeSettings({ customizes: null })
        goBack(UNMOUNT)
    }

    setParams = (values = null) => {

        const { type } = this.props
        let params = {}

        switch (type) {

            case CUSTOMIZE_TYPE.INVOICES:
                if (values) {
                    params = {
                        invoice_prefix: values.invoice_prefix,
                        type: "INVOICES"
                    }
                }
                else {
                    params = {
                        headerTitle: "header.invoices",
                        prefixLabel: "customizes.prefix.invoice",
                        prefixName: "invoice_prefix",
                        autoGenerateTitle: "customizes.autoGenerate.invoice",
                        autoGenerateName: "invoice_auto_generate",
                        autoGenerateDescription: "customizes.autoGenerate.invoiceDescription",
                        settingLabel: "customizes.setting.invoice",
                    }
                }
                break;

            case CUSTOMIZE_TYPE.ESTIMATES:
                if (values) {
                    params = {
                        estimate_prefix: values.estimate_prefix,
                        type: "ESTIMATES"
                    }
                }
                else {
                    params = {
                        headerTitle: "header.estimates",
                        prefixLabel: "customizes.prefix.estimate",
                        prefixName: "estimate_prefix",
                        autoGenerateTitle: "customizes.autoGenerate.estimate",
                        autoGenerateName: "estimate_auto_generate",
                        autoGenerateDescription: "customizes.autoGenerate.estimateDescription",
                        settingLabel: "customizes.setting.estimate",
                    }
                }
                break;

            case CUSTOMIZE_TYPE.PAYMENTS:
                if (values) {
                    params = {
                        payment_prefix: values.payment_prefix,
                        type: "PAYMENTS"
                    }
                }
                else {
                    params = {
                        headerTitle: "header.payments",
                        prefixLabel: "customizes.prefix.payment",
                        prefixName: "payment_prefix",
                        autoGenerateTitle: "customizes.autoGenerate.payment",
                        autoGenerateName: "payment_auto_generate",
                        autoGenerateDescription: "customizes.autoGenerate.paymentDescription",
                        settingLabel: "customizes.setting.payment"
                    }
                }
                break;

            case CUSTOMIZE_TYPE.ITEMS:
                params = {
                    headerTitle: "header.units",
                }
                break;

            default:
                break;
        }

        return params
    }

    setFormField = (field, value) => {
        this.props.dispatch(change(CUSTOMIZE_FORM, field, value));
    };

    changeAutoGenerateStatus = (field, status) => {

        this.setFormField(field, status)

        const { editSettingItem } = this.props
        const { data: { autoGenerateName } } = this.state

        editSettingItem({
            params: {
                key: autoGenerateName,
                value: status === true ? 'YES' : 'NO'
            },
            hasCustomize: true,
            onResult: () => {
                this.toggleToast()
                this.setState({ isUpdateAutoGenerate: true })
            }
        })
    }

    onSave = (values) => {

        const { editCustomizeSettings, navigation } = this.props
        const params = this.setParams(values)

        editCustomizeSettings({ params, navigation })
    }

    toggleToast = () => {
        this.props.navigation.setParams({
            "toastMsg": "settings.preferences.settingUpdate"
        })
    }

    BOTTOM_ACTION = () => {
        const { language, loading, handleSubmit, type } = this.props
        const { activeTab } = this.state

        let isPaymentMode = (type === CUSTOMIZE_TYPE.PAYMENTS && activeTab === PAYMENT_TABS.MODE)
        let isItemScreen = type === CUSTOMIZE_TYPE.ITEMS

        let title = (isPaymentMode || isItemScreen) ? "button.add" : "button.save"

        return (
            <View style={styles.submitButton}>
                <View style={{ flex: 1 }}>
                    <CtButton
                        onPress={() => isPaymentMode ?
                            this.paymentChild.current.openModal() :
                            isItemScreen ?
                                this.itemChild.current.openModal()
                                : handleSubmit(this.onSave)()
                        }
                        btnTitle={Lng.t(title, { locale: language })}
                        containerStyle={styles.handleBtn}
                        loading={loading}
                    />
                </View>
            </View>
        )
    }

    TOGGLE_FIELD_VIEW = (language, data) => {

        return (
            <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                <CtDivider dividerStyle={styles.dividerLine} />

                <Text style={styles.autoGenerateHeader}>
                    {Lng.t(data.settingLabel, { locale: language })}
                </Text>
                <Field
                    name={data.autoGenerateName}
                    component={ToggleSwitch}
                    hint={Lng.t(data.autoGenerateTitle, { locale: language })}
                    description={Lng.t(data.autoGenerateDescription, { locale: language })}
                    onChangeCallback={(val) =>
                        this.changeAutoGenerateStatus(data.autoGenerateName, val)
                    }
                />
            </ScrollView>
        )
    }

    PREFIX_FIELD = (language, data) => {

        return (
            <Field
                name={data.prefixName}
                component={InputField}
                hint={Lng.t(data.prefixLabel, { locale: language })}
                inputProps={{
                    returnKeyType: 'next',
                    autoCorrect: true,
                    autoCapitalize: 'characters',
                    maxLength: 5
                }}
                fieldName={Lng.t("customizes.prefix.title", { locale: language })}
                maxCharacter={5}
                isRequired
            />
        )
    }

    setActiveTab = (activeTab) => {
        this.setState({ activeTab });
    }

    PAYMENT_CUSTOMIZE_TAB = () => {
        const { language } = this.props
        const { activeTab, data } = this.state

        return (
            <Tabs
                activeTab={activeTab}
                style={styles.tabs}
                tabStyle={styles.tabView}
                setActiveTab={this.setActiveTab}
                tabs={[
                    {
                        Title: PAYMENT_TABS.MODE,
                        tabName: Lng.t("payments.modes", { locale: language }),
                        render: (
                            <ScrollView keyboardShouldPersistTaps='handled'>
                                <PaymentModes
                                    ref={this.paymentChild}
                                    props={this.props}
                                    setFormField={(field, value) => this.setFormField(field, value)}
                                />
                            </ScrollView>
                        )
                    },
                    {
                        Title: PAYMENT_TABS.PREFIX,
                        tabName: Lng.t("payments.prefix", { locale: language }),
                        render: (
                            <View style={styles.bodyContainer}>

                                {this.PREFIX_FIELD(language, data)}

                                {this.TOGGLE_FIELD_VIEW(language, data)}

                            </View>
                        )
                    }
                ]}
            />
        )
    }

    render() {
        const {
            navigation,
            language,
            type,
            isLoading,
            formValues,
        } = this.props;

        const { data } = this.state

        let toastMessage = navigation.getParam('toastMsg', '')
        let isItemsScreen = (type === CUSTOMIZE_TYPE.ITEMS)
        let isPaymentsScreen = (type === CUSTOMIZE_TYPE.PAYMENTS)

        let loading = isItemsScreen ? !hasObjectLength(data) :
            !hasObjectLength(data) || isLoading || !hasObjectLength(formValues)

        return (
            <DefaultLayout
                headerProps={{
                    leftIconPress: () => navigation.navigate(ROUTES.CUSTOMIZES),
                    title: Lng.t(data.headerTitle, { locale: language }),
                    titleStyle: headerTitle({ marginLeft: -26, marginRight: -50 }),
                    rightIconPress: null,
                    placement: "center",
                }}
                bottomAction={this.BOTTOM_ACTION()}
                toastProps={{
                    message: Lng.t(toastMessage, { locale: language }),
                    visible: toastMessage
                }}
                loadingProps={{ is: loading }}
                hideScrollView
            >

                {isPaymentsScreen && this.PAYMENT_CUSTOMIZE_TAB()}

                {isItemsScreen && (
                    <ScrollView keyboardShouldPersistTaps='handled'>
                        <Units
                            ref={this.itemChild}
                            props={this.props}
                            setFormField={(field, value) => this.setFormField(field, value)}
                        />
                    </ScrollView>
                )}

                {!isPaymentsScreen && !isItemsScreen && (
                    <View style={styles.bodyContainer}>

                        {this.PREFIX_FIELD(language, data)}

                        {this.TOGGLE_FIELD_VIEW(language, data)}

                    </View>
                )}

            </DefaultLayout>
        );
    }
}
