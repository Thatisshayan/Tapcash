declare module "firebase/auth" {
  import { FirebaseApp } from "firebase/app";
  import type {
    User,
    Auth,
    UserCredential,
    AuthCredential,
    AuthProvider,
    ActionCodeSettings,
    ApplicationVerifier,
    ConfirmationResult,
    IdTokenResult,
    MultiFactorResolver,
    MultiFactorError,
    MultiFactorUser,
    PhoneAuthCredential,
    Unsubscribe,
    NextOrObserver,
    ErrorFn,
    CompleteFn,
    Persistence,
    Dependencies,
  } from "@firebase/auth-types";

  export function getAuth(app?: FirebaseApp): Auth;
  export function initializeAuth(app: FirebaseApp, deps?: Dependencies): Auth;
  export function connectAuthEmulator(auth: Auth, url: string, options?: { disableWarnings?: boolean }): void;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithPopup(auth: Auth, provider: AuthProvider, resolver?: any): Promise<UserCredential>;
  export function signInWithRedirect(auth: Auth, provider: AuthProvider, resolver?: any): Promise<void>;
  export function signOut(auth: Auth): Promise<void>;
  export function sendEmailVerification(user: User, actionCodeSettings?: ActionCodeSettings | null): Promise<void>;
  export function sendPasswordResetEmail(auth: Auth, email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
  export function sendSignInLinkToEmail(auth: Auth, email: string, actionCodeSettings: ActionCodeSettings): Promise<void>;
  export function signInWithEmailLink(auth: Auth, email: string, emailLink?: string): Promise<UserCredential>;
  export function isSignInWithEmailLink(auth: Auth, emailLink: string): boolean;
  export function applyActionCode(auth: Auth, oobCode: string): Promise<void>;
  export function checkActionCode(auth: Auth, oobCode: string): Promise<any>;
  export function confirmPasswordReset(auth: Auth, oobCode: string, newPassword: string): Promise<void>;
  export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]>;
  export function getIdToken(user: User, forceRefresh?: boolean): Promise<string>;
  export function getIdTokenResult(user: User, forceRefresh?: boolean): Promise<IdTokenResult>;
  export function getRedirectResult(auth: Auth, resolver?: any): Promise<UserCredential | null>;
  export function getMultiFactorResolver(auth: Auth, error: MultiFactorError): MultiFactorResolver;
  export function initializeRecaptchaConfig(auth: Auth): Promise<void>;
  export function linkWithCredential(user: User, credential: AuthCredential): Promise<UserCredential>;
  export function linkWithPhoneNumber(user: User, phoneNumber: string, appVerifier?: ApplicationVerifier): Promise<ConfirmationResult>;
  export function linkWithPopup(user: User, provider: AuthProvider, resolver?: any): Promise<UserCredential>;
  export function linkWithRedirect(user: User, provider: AuthProvider, resolver?: any): Promise<void>;
  export function multiFactor(user: User): MultiFactorUser;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: NextOrObserver<User>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
  export function onIdTokenChanged(auth: Auth, nextOrObserver: NextOrObserver<User>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
  export function reauthenticateWithCredential(user: User, credential: AuthCredential): Promise<UserCredential>;
  export function reauthenticateWithPhoneNumber(user: User, phoneNumber: string, appVerifier?: ApplicationVerifier): Promise<ConfirmationResult>;
  export function reauthenticateWithPopup(user: User, provider: AuthProvider, resolver?: any): Promise<UserCredential>;
  export function reauthenticateWithRedirect(user: User, provider: AuthProvider, resolver?: any): Promise<void>;
  export function reload(user: User): Promise<void>;
  export function revokeAccessToken(auth: Auth, token: string): Promise<void>;
  export function setPersistence(auth: Auth, persistence: Persistence): Promise<void>;
  export function signInAnonymously(auth: Auth): Promise<UserCredential>;
  export function signInWithCredential(auth: Auth, credential: AuthCredential): Promise<UserCredential>;
  export function signInWithCustomToken(auth: Auth, customToken: string): Promise<UserCredential>;
  export function signInWithPhoneNumber(auth: Auth, phoneNumber: string, appVerifier?: ApplicationVerifier): Promise<ConfirmationResult>;
  export function unlink(user: User, providerId: string): Promise<User>;
  export function updateCurrentUser(auth: Auth, user: User | null): Promise<void>;
  export function updateEmail(user: User, newEmail: string): Promise<void>;
  export function updatePassword(user: User, newPassword: string): Promise<void>;
  export function updatePhoneNumber(user: User, credential: PhoneAuthCredential): Promise<void>;
  export function updateProfile(user: User, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  export function useDeviceLanguage(auth: Auth): void;
  export function verifyBeforeUpdateEmail(user: User, newEmail: string, actionCodeSettings?: ActionCodeSettings | null): Promise<void>;
  export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string>;

  export class GoogleAuthProvider implements AuthProvider {
    providerId: string;
    static PROVIDER_ID: string;
    static GOOGLE_SIGN_IN_METHOD: string;
    static credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
    addScope(scope: string): AuthProvider;
    setCustomParameters(customOAuthParameters: Object): AuthProvider;
  }

  export class EmailAuthProvider implements AuthProvider {
    providerId: string;
    static PROVIDER_ID: string;
    static EMAIL_PASSWORD_SIGN_IN_METHOD: string;
    static EMAIL_LINK_SIGN_IN_METHOD: string;
    static credential(email: string, password: string): AuthCredential;
    static credentialWithLink(email: string, emailLink: string): AuthCredential;
  }

  export class FacebookAuthProvider implements AuthProvider {
    providerId: string;
    static PROVIDER_ID: string;
    static FACEBOOK_SIGN_IN_METHOD: string;
    static credential(token: string): AuthCredential;
  }

  export class GithubAuthProvider implements AuthProvider {
    providerId: string;
    static PROVIDER_ID: string;
    static GITHUB_SIGN_IN_METHOD: string;
    static credential(token: string): AuthCredential;
  }

  export class PhoneAuthProvider implements AuthProvider {
    providerId: string;
    static PROVIDER_ID: string;
    static PHONE_SIGN_IN_METHOD: string;
    static credential(verificationId: string, verificationCode: string): AuthCredential;
  }

  export class RecaptchaVerifier implements ApplicationVerifier {
    type: string;
    constructor(container: any, parameters?: Object | null, app?: FirebaseApp | null);
    clear(): void;
    render(): Promise<number>;
    verify(): Promise<string>;
  }

  export class OAuthProvider implements AuthProvider {
    providerId: string;
    constructor(providerId: string);
    addScope(scope: string): AuthProvider;
    credential(optionsOrIdToken: any, accessToken?: string): AuthCredential;
    setCustomParameters(customOAuthParameters: Object): AuthProvider;
  }

  export class SAMLAuthProvider implements AuthProvider {
    providerId: string;
    constructor(providerId: string);
  }

  export class TwitterAuthProvider implements AuthProvider {
    providerId: string;
    static PROVIDER_ID: string;
    static TWITTER_SIGN_IN_METHOD: string;
    static credential(token: string, secret: string): AuthCredential;
  }

  export type { User, Auth, UserCredential, AuthCredential, AuthProvider, ActionCodeSettings, ApplicationVerifier, ConfirmationResult, IdTokenResult, MultiFactorResolver, MultiFactorError, MultiFactorUser, PhoneAuthCredential, Unsubscribe, NextOrObserver, ErrorFn, CompleteFn, Persistence, Dependencies } from "@firebase/auth-types";
}
