import koffi from 'koffi';
import { logger } from './logger.js';

const isMock = !process.env.HCISUPSDK_LIB_DIR || process.env.ISUP_MOCK === '1';

/**
 * Crea el binding al SDK (real o mock). El resto del daemon nunca toca
 * koffi/HCISUPSDK directo — sólo conoce start()/stop() y los tres callbacks.
 */
export function createSdk({ onConnect, onDisconnect, onEvent }) {
    return isMock
        ? createMockSdk({ onConnect, onDisconnect, onEvent })
        : createRealSdk({ onConnect, onDisconnect, onEvent });
}

/**
 * Modo mock: no habla HCISUPSDK en absoluto. Sirve para poder correr y probar
 * todo el resto del pipeline (forwarding a Laravel, retry queue, logging)
 * antes de tener acceso al SDK real. Con ISUP_MOCK_SIMULATE=1 además simula
 * un terminal conectándose y mandando una fichada, para probar end-to-end.
 */
function createMockSdk({ onConnect, onDisconnect, onEvent }) {
    logger.warn('sdk.js en modo MOCK — no hay HCISUPSDK_LIB_DIR configurado (o ISUP_MOCK=1). No se está escuchando ISUP real, ningún terminal físico se va a poder conectar.');

    let timers = [];

    return {
        start(port) {
            logger.info('MOCK: listener "arrancado" (no hay socket real escuchando)', { port });

            if (process.env.ISUP_MOCK_SIMULATE === '1') {
                const accountId = process.env.ISUP_MOCK_ACCOUNT_ID || 'mock-account';

                timers.push(setTimeout(() => {
                    onConnect({ accountId, sourceIp: '127.0.0.1', serialNo: 'MOCK-SERIAL' });

                    timers.push(setTimeout(() => {
                        onEvent({
                            accountId,
                            serialNo: 'MOCK-SERIAL',
                            eventType: 'AccessControllerEvent',
                            eventTime: new Date().toISOString(),
                            accessControllerEvent: {
                                employeeNoString: process.env.ISUP_MOCK_EMPLOYEE_NO || '1',
                                attendanceStatus: 'undefined',
                                currentVerifyMode: 'face',
                            },
                        });
                    }, 3000));
                }, 3000));
            }
        },
        stop() {
            timers.forEach(clearTimeout);
            timers = [];
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────
// Binding real a HCISUPSDK (distinto del Device Network SDK / HCNetSDK
// genérico — es el paquete específico para el protocolo EHome/ISUP, con
// soporte nativo para eventos de control de acceso vía "ISAPI passthrough").
//
// Firmas y layouts de structs verificados contra los headers reales de
// HCISUPSDK (bundlados en el repo de referencia corenel/ip-camera-ehome-server,
// thirdparty/HCISUPSDK/linux64/include/*.h) — HCISUPCMS.h y HCISUPAlarm.h.
//
// Flujo:
//   1. NET_ECMS_Init() + NET_ECMS_StartListen(...) — registro de terminales.
//      El callback recibe NET_EHOME_DEV_REG_INFO con byDeviceID (nuestro
//      Account ID), sDeviceSerial, struDevAdd.szIP en ENUM_DEV_ON/OFF.
//   2. NET_EALARM_Init() + NET_EALARM_StartListen(..., byUseCmsPort=1) —
//      alarmas, reusando el mismo puerto que el registro. El callback recibe
//      NET_EHOME_ALARM_MSG; cuando dwAlarmType == EHOME_ALARM_ACS (11), el
//      campo pAlarmInfo apunta a NET_EHOME_ALARM_ISAPI_INFO, que trae el
//      AccessControllerEvent crudo (XML o JSON, mismo formato que ya entiende
//      HikVisionEventProcessor::decodePayload() del lado Laravel) en
//      pAlarmData/dwAlarmDataLen/byDataType (1-xml, 2-json).
//
// No implementado (fuera de alcance mientras el terminal esté en ISUP4.0):
// ENUM_DEV_AUTH/ENUM_DEV_SESSIONKEY (intercambio de Encryption Key de
// EHome5.0) — el callback los loguea si llegan, pero no responde la clave.
// ─────────────────────────────────────────────────────────────────────────

const EHOME_ALARM_ACS = 11; // HCISUPAlarm.h: 门禁事件上报 (access control event report)

const ENUM_DEV_ON = 0;
const ENUM_DEV_OFF = 1;
const ENUM_DEV_ADDRESS_CHANGED = 2;
const ENUM_DEV_AUTH = 3;
const ENUM_DEV_SESSIONKEY = 4;

// EHome5.0: clave que hay que cargar EXACTO igual en el terminal (Encryption
// Key, pestaña ISUP). La elige el servidor (acá), no Hikvision — se la
// respondemos al equipo cuando pide autenticarse (ENUM_DEV_AUTH).
const EHOME_KEY = process.env.ISUP_EHOME_KEY || 'ArtDent2026Key';

function defineTypes() {
    // NET_EHOME_IPADDRESS — HCISUPPublic.h
    koffi.struct('NET_EHOME_IPADDRESS', {
        szIP: koffi.array('char', 128),
        wPort: 'uint16',
        byRes: koffi.array('char', 2),
    });

    // typedef BOOL (CALLBACK * DEVICE_REGISTER_CB)(LONG lUserID, DWORD dwDataType, void *pOutBuffer, DWORD dwOutLen, void *pInBuffer, DWORD dwInLen, void *pUser);
    koffi.proto('DEVICE_REGISTER_CB', 'bool', ['int32', 'uint32', 'void *', 'uint32', 'void *', 'uint32', 'void *']);

    // NET_EHOME_CMS_LISTEN_PARAM — HCISUPCMS.h
    koffi.struct('NET_EHOME_CMS_LISTEN_PARAM', {
        struAddress: 'NET_EHOME_IPADDRESS',
        fnCB: koffi.pointer('DEVICE_REGISTER_CB'),
        pUserData: 'void *',
        dwKeepAliveSec: 'uint32',
        dwTimeOutCount: 'uint32',
        byRes: koffi.array('uint8', 24),
    });

    // NET_EHOME_DEV_REG_INFO — HCISUPCMS.h (MAX_DEVICE_ID_LEN=256, NET_EHOME_SERIAL_LEN=12, MAX_MASTER_KEY_LEN=16)
    koffi.struct('NET_EHOME_DEV_REG_INFO', {
        dwSize: 'uint32',
        dwNetUnitType: 'uint32',
        byDeviceID: koffi.array('uint8', 256),
        byFirmwareVersion: koffi.array('uint8', 24),
        struDevAdd: 'NET_EHOME_IPADDRESS',
        dwDevType: 'uint32',
        dwManufacture: 'uint32',
        byPassWord: koffi.array('uint8', 32),
        sDeviceSerial: koffi.array('uint8', 12),
        byReliableTransmission: 'uint8',
        byWebSocketTransmission: 'uint8',
        bySupportRedirect: 'uint8',
        byDevProtocolVersion: koffi.array('uint8', 6),
        bySessionKey: koffi.array('uint8', 16),
        byMarketType: 'uint8',
        byRes: koffi.array('uint8', 26),
    });

    // NET_EHOME_DEV_REG_INFO_V12 — HCISUPCMS.h (variante que se usa en los
    // callbacks ENUM_DEV_AUTH/ENUM_DEV_SESSIONKEY de EHome5.0)
    koffi.struct('NET_EHOME_DEV_REG_INFO_V12', {
        struRegInfo: 'NET_EHOME_DEV_REG_INFO',
        struRegAddr: 'NET_EHOME_IPADDRESS',
        sDevName: koffi.array('uint8', 64),
        byDeviceFullSerial: koffi.array('uint8', 64),
        byRes: koffi.array('uint8', 128),
    });

    // NET_EHOME_DEV_SESSIONKEY — HCISUPPublic.h
    koffi.struct('NET_EHOME_DEV_SESSIONKEY', {
        sDeviceID: koffi.array('uint8', 256),
        sSessionKey: koffi.array('uint8', 16),
    });

    // NET_EHOME_ALARM_MSG — HCISUPAlarm.h (tiene que definirse antes del proto
    // de EHomeMsgCallBack, que la referencia por nombre)
    koffi.struct('NET_EHOME_ALARM_MSG', {
        dwAlarmType: 'uint32',
        pAlarmInfo: 'void *',
        dwAlarmInfoLen: 'uint32',
        pXmlBuf: 'void *',
        dwXmlBufLen: 'uint32',
        sSerialNumber: koffi.array('char', 12),
        pHttpUrl: 'void *',
        dwHttpUrlLen: 'uint32',
        byRes: koffi.array('uint8', 12),
    });

    // typedef BOOL (CALLBACK *EHomeMsgCallBack)(LONG iHandle, NET_EHOME_ALARM_MSG *pAlarmMsg, void* pUser);
    koffi.proto('EHomeMsgCallBack', 'bool', ['int32', 'NET_EHOME_ALARM_MSG *', 'void *']);

    // NET_EHOME_ALARM_LISTEN_PARAM — HCISUPAlarm.h
    koffi.struct('NET_EHOME_ALARM_LISTEN_PARAM', {
        struAddress: 'NET_EHOME_IPADDRESS',
        fnMsgCb: koffi.pointer('EHomeMsgCallBack'),
        pUserData: 'void *',
        byProtocolType: 'uint8',
        byUseCmsPort: 'uint8',
        byUseThreadPool: 'uint8',
        byRes1: 'uint8',
        dwKeepAliveSec: 'uint32',
        dwTimeOutCount: 'uint32',
        byRes: koffi.array('uint8', 20),
    });

    // NET_EHOME_ALARM_ISAPI_INFO — HCISUPAlarm.h (el ACS event viaja acá adentro)
    koffi.struct('NET_EHOME_ALARM_ISAPI_INFO', {
        pAlarmData: 'void *',
        dwAlarmDataLen: 'uint32',
        byDataType: 'uint8', // 0-invalid, 1-xml, 2-json
        byPicturesNumber: 'uint8',
        byRes: koffi.array('uint8', 2),
        pPicPackData: 'void *',
        byRes1: koffi.array('uint8', 32),
    });
}

function cString(bytes) {
    const nul = bytes.indexOf(0);
    const slice = nul === -1 ? bytes : bytes.subarray(0, nul);

    return Buffer.from(slice).toString('utf8');
}

function createRealSdk({ onConnect, onDisconnect, onEvent }) {
    defineTypes();

    const libDir = process.env.HCISUPSDK_LIB_DIR;
    const cms = koffi.load(`${libDir}/libHCISUPCMS.so`);
    const alarm = koffi.load(`${libDir}/libHCISUPAlarm.so`);

    const NET_ECMS_Init = cms.func('bool NET_ECMS_Init()');
    const NET_ECMS_Fini = cms.func('bool NET_ECMS_Fini()');
    const NET_ECMS_GetLastError = cms.func('uint32 NET_ECMS_GetLastError()');
    const NET_ECMS_StartListen = cms.func('int32 NET_ECMS_StartListen(NET_EHOME_CMS_LISTEN_PARAM *lpCMSListenPara)');
    const NET_ECMS_StopListen = cms.func('bool NET_ECMS_StopListen(int32 iHandle)');
    const NET_ECMS_ForceLogout = cms.func('bool NET_ECMS_ForceLogout(int32 lUserID)');
    const NET_ECMS_SetDeviceSessionKey = cms.func('bool NET_ECMS_SetDeviceSessionKey(NET_EHOME_DEV_SESSIONKEY *pDeviceKey)');

    const NET_EALARM_Init = alarm.func('bool NET_EALARM_Init()');
    const NET_EALARM_Fini = alarm.func('bool NET_EALARM_Fini()');
    const NET_EALARM_GetLastError = alarm.func('uint32 NET_EALARM_GetLastError()');
    const NET_EALARM_StartListen = alarm.func('int32 NET_EALARM_StartListen(NET_EHOME_ALARM_LISTEN_PARAM *pAlarmListenParam)');
    const NET_EALARM_StopListen = alarm.func('bool NET_EALARM_StopListen(int32 iListenHandle)');

    if (!NET_ECMS_Init()) {
        throw new Error(`NET_ECMS_Init falló (NET_ECMS_GetLastError=${NET_ECMS_GetLastError()})`);
    }
    if (!NET_EALARM_Init()) {
        throw new Error(`NET_EALARM_Init falló (NET_EALARM_GetLastError=${NET_EALARM_GetLastError()})`);
    }

    logger.info('HCISUPSDK inicializado (NET_ECMS_Init / NET_EALARM_Init OK)');

    // Terminales conectados por Device ID (Account ID). HCISUPSDK sí avisa
    // desconexión explícita (ENUM_DEV_OFF), a diferencia del HCNetSDK
    // genérico — no hace falta inferir por inactividad acá.
    const connected = new Map(); // accountId -> { serialNo, sourceIp }

    function handleRegister(lUserID, dwDataType, pOutBuffer, dwOutLen, pInBuffer /* , dwInLen, pUser */) {
        try {
            if (dwDataType === ENUM_DEV_ON) {
                const info = koffi.decode(pOutBuffer, 'NET_EHOME_DEV_REG_INFO');
                const accountId = cString(info.byDeviceID);
                const serialNo = cString(info.sDeviceSerial);
                const sourceIp = cString(Buffer.from(info.struDevAdd.szIP));

                connected.set(accountId, { serialNo, sourceIp, lUserID });
                onConnect({ accountId, serialNo, sourceIp });
                // dwKeepAliveSec/dwTimeOutCount de NET_EHOME_SERVER_INFO (pInBuffer)
                // se dejan en 0 a propósito — el SDK documenta que 0 usa los
                // defaults (15s / 6 timeouts), no hace falta escribir la respuesta.
            } else if (dwDataType === ENUM_DEV_OFF) {
                const accountId = [...connected.entries()].find(([, v]) => v.lUserID === lUserID)?.[0];

                if (accountId) {
                    connected.delete(accountId);
                    onDisconnect({ accountId });
                } else {
                    logger.warn('ENUM_DEV_OFF de un lUserID no registrado', { lUserID });
                }
            } else if (dwDataType === ENUM_DEV_ADDRESS_CHANGED) {
                logger.info('Terminal cambió de dirección', { lUserID });
            } else if (dwDataType === ENUM_DEV_AUTH) {
                // EHome5.0: el terminal pide autenticarse. Le respondemos con
                // la clave que el admin cargó en el terminal (Encryption Key,
                // pestaña ISUP) — tiene que ser idéntica a EHOME_KEY.
                const info = koffi.decode(pOutBuffer, 'NET_EHOME_DEV_REG_INFO_V12');
                const accountId = cString(info.struRegInfo.byDeviceID);

                logger.info('Terminal pidió autenticación EHome5.0', { accountId, lUserID });

                const keyBytes = [...Buffer.from(EHOME_KEY, 'utf8'), 0];
                koffi.encode(pInBuffer, 'char', keyBytes, keyBytes.length);
            } else if (dwDataType === ENUM_DEV_SESSIONKEY) {
                // EHome5.0: el terminal ya validó la clave y manda su
                // SessionKey — hay que registrarla para que el resto de la
                // sesión (incluidas las alarmas) se decodifique bien.
                const info = koffi.decode(pOutBuffer, 'NET_EHOME_DEV_REG_INFO_V12');
                const accountId = cString(info.struRegInfo.byDeviceID);

                const ok = NET_ECMS_SetDeviceSessionKey({
                    sDeviceID: info.struRegInfo.byDeviceID,
                    sSessionKey: info.struRegInfo.bySessionKey,
                });

                logger.info('SessionKey EHome5.0 registrada', { accountId, ok });
            }
        } catch (error) {
            logger.error('Error procesando callback de registro HCISUPSDK', { error: String(error), stack: error?.stack });
        }

        return true;
    }

    function handleAlarm(iHandle, pAlarmMsg /* , pUser */) {
        try {
            const msg = koffi.decode(pAlarmMsg, 'NET_EHOME_ALARM_MSG');

            if (msg.dwAlarmType !== EHOME_ALARM_ACS) {
                return true; // no es un evento de control de acceso, se ignora
            }

            if (!msg.pAlarmInfo || msg.dwAlarmInfoLen === 0) {
                logger.debug('Alarma ACS sin pAlarmInfo', { serialNo: cString(Buffer.from(msg.sSerialNumber)) });

                return true;
            }

            const isapiInfo = koffi.decode(msg.pAlarmInfo, 'NET_EHOME_ALARM_ISAPI_INFO');

            if (!isapiInfo.pAlarmData || isapiInfo.dwAlarmDataLen === 0) {
                return true;
            }

            const rawPayload = koffi.decode(isapiInfo.pAlarmData, 'char *', isapiInfo.dwAlarmDataLen);
            const format = isapiInfo.byDataType === 2 ? 'json' : 'xml';
            const serialNo = cString(Buffer.from(msg.sSerialNumber));

            const accountId = [...connected.entries()].find(([, v]) => v.serialNo === serialNo)?.[0] ?? null;

            onEvent({
                accountId,
                serialNo,
                eventType: 'AccessControllerEvent',
                eventTime: new Date().toISOString(),
                rawPayload,
                format,
            });
        } catch (error) {
            logger.error('Error procesando callback de alarma HCISUPSDK', { error: String(error), stack: error?.stack });
        }

        return true;
    }

    let regListenHandle = null;
    let alarmListenHandle = null;
    let registerCallbackRef = null;
    let alarmCallbackRef = null;

    return {
        start(port) {
            registerCallbackRef = koffi.register(handleRegister, koffi.pointer('DEVICE_REGISTER_CB'));

            const listenParam = {
                struAddress: { szIP: Buffer.alloc(128), wPort: port, byRes: [0, 0] },
                fnCB: registerCallbackRef,
                pUserData: null,
                dwKeepAliveSec: 5,
                dwTimeOutCount: 6,
                byRes: new Array(24).fill(0),
            };

            regListenHandle = NET_ECMS_StartListen(listenParam);

            if (regListenHandle < 0) {
                throw new Error(`NET_ECMS_StartListen falló (NET_ECMS_GetLastError=${NET_ECMS_GetLastError()})`);
            }

            logger.info('HCISUPSDK escuchando registro ISUP', { port, regListenHandle });

            alarmCallbackRef = koffi.register(handleAlarm, koffi.pointer('EHomeMsgCallBack'));

            const alarmParam = {
                struAddress: { szIP: Buffer.from('127.0.0.1\0'.padEnd(128, '\0')), wPort: 0, byRes: [0, 0] },
                fnMsgCb: alarmCallbackRef,
                pUserData: null,
                byProtocolType: 0,
                byUseCmsPort: 1, // reusa el mismo puerto que el registro (loopback local, ver comentario del header)
                byUseThreadPool: 0,
                byRes1: 0,
                dwKeepAliveSec: 5,
                dwTimeOutCount: 6,
                byRes: new Array(20).fill(0),
            };

            alarmListenHandle = NET_EALARM_StartListen(alarmParam);

            if (alarmListenHandle < 0) {
                throw new Error(`NET_EALARM_StartListen falló (NET_EALARM_GetLastError=${NET_EALARM_GetLastError()})`);
            }

            logger.info('HCISUPSDK escuchando alarmas ISUP (mismo puerto)', { alarmListenHandle });
        },
        stop() {
            if (alarmListenHandle !== null) {
                NET_EALARM_StopListen(alarmListenHandle);
                alarmListenHandle = null;
            }
            if (regListenHandle !== null) {
                NET_ECMS_StopListen(regListenHandle);
                regListenHandle = null;
            }
            if (alarmCallbackRef) {
                koffi.unregister(alarmCallbackRef);
                alarmCallbackRef = null;
            }
            if (registerCallbackRef) {
                koffi.unregister(registerCallbackRef);
                registerCallbackRef = null;
            }
            NET_EALARM_Fini();
            NET_ECMS_Fini();
        },
    };
}
