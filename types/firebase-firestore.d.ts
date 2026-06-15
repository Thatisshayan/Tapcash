declare module "firebase/firestore" {
  import { FirebaseApp } from "firebase/app";

  export interface DocumentData {
    [field: string]: any;
  }

  export interface Firestore {
    type: "firestore";
    app: FirebaseApp;
  }

  export interface DocumentReference<T = DocumentData> {
    type: "document";
    id: string;
    path: string;
    parent: CollectionReference<T>;
    firestore: Firestore;
  }

  export interface DocumentSnapshot<T = DocumentData> {
    readonly id: string;
    readonly ref: DocumentReference<T>;
    readonly exists: () => boolean;
    readonly data: () => T | undefined;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<T> {
    readonly data: () => T;
  }

  export interface CollectionReference<T = DocumentData> extends Query<T> {
    readonly id: string;
    readonly path: string;
    readonly parent: DocumentReference | null;
    readonly firestore: Firestore;
    type: string;
  }

  export interface Query<T = DocumentData> {
    type: string;
    readonly firestore: Firestore;
  }

  export interface QuerySnapshot<T = DocumentData> {
    readonly docs: QueryDocumentSnapshot<T>[];
    readonly size: number;
    readonly empty: boolean;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }

  export type WhereFilterOp = "<" | "<=" | "==" | "!==" | ">=" | ">" | "array-contains" | "in" | "array-contains-any" | "not-in";
  export type OrderByDirection = "desc" | "asc";
  export type Timestamp = any;
  export type FieldValue = any;
  export type SetOptions = any;
  export type UpdateData<T = DocumentData> = Record<string, any>;
  export type WriteBatch = any;
  export type Transaction = any;
  export type WithFieldValue<T> = T;

  export function getFirestore(app?: FirebaseApp): Firestore;
  export function collection(firestore: Firestore, path: string, ...pathSegments: string[]): CollectionReference<DocumentData>;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData>;
  export function doc<T>(collectionRef: CollectionReference<T>, documentId?: string): DocumentReference<T>;
  export function getDoc<T>(documentRef: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  export function getDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>>;
  export function setDoc<T extends DocumentData>(reference: DocumentReference<T>, data: T, options?: SetOptions): Promise<void>;
  export function updateDoc(reference: DocumentReference, data: Record<string, any>): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function addDoc<T extends DocumentData>(reference: CollectionReference<T>, data: T): Promise<DocumentReference<T>>;
  export function onSnapshot(query: Query, onNext: (snapshot: QuerySnapshot) => void, onError?: (error: Error) => void, onCompletion?: () => void): () => void;
  export function onSnapshot<T>(reference: DocumentReference<T>, onNext: (snapshot: DocumentSnapshot<T>) => void, onError?: (error: Error) => void, onCompletion?: () => void): () => void;
  export function query<T>(queryObj: Query<T>, ...queryConstraints: any[]): Query<T>;
  export function where(fieldPath: string | any, opStr: WhereFilterOp, value: any): any;
  export function orderBy(fieldPath: string | any, directionStr?: OrderByDirection): any;
  export function limit(limit: number): any;
  export function limitToLast(limit: number): any;
  export function serverTimestamp(): FieldValue;
  export function writeBatch(firestore: Firestore): WriteBatch;
  export function runTransaction<T>(firestore: Firestore, updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
}
