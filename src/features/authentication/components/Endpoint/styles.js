import { colors } from '@/styles';
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        display: 'flex',
        paddingHorizontal: 5
    },
    main: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 25,
        justifyContent: 'center'
    },
    inputField: {
        height: 44
    },
    logoContainer: {
        paddingBottom: 40,
        alignItems: 'center',
        marginTop: -30
    },
    imgLogo: {
        width: width - 150,
        height: 120,
        resizeMode: 'contain'
    },
    endpointTextTitle: {
        marginTop: 15,
        color: colors.veryDarkGray
    },
    SendingMailContainer: {
        alignItems: 'center'
    },
    buttonContainer: {
        marginHorizontal: -5,
        marginTop: 55
    },
    buttonStyle: {
        paddingVertical: 10
    },
    skipButtonStyle: {
        marginTop: 5,
        marginHorizontal: -5
    }
});
