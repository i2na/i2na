import { MONGODB } from "@server/config/constants";
import { HttpError } from "@server/utils/http-error";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";

interface IMongoUpdateResponse {
    matchedCount: number;
    modifiedCount: number;
    upsertedId?: unknown;
}

interface IMongoDeleteResponse {
    deletedCount: number;
}

type TMongoInput = Record<string, unknown>;

type TMongoClientGlobal = typeof globalThis & {
    __i2naMongoClientPromise?: Promise<MongoClient>;
};

function assertMongoConfig(): void {
    if (!MONGODB.URI) {
        throw new HttpError(500, "MongoDB connection config is missing (MONGO_URI)");
    }

    if (MONGODB.URI.includes("your-mongo-uri")) {
        throw new HttpError(500, "Set MONGO_URI in .env.local");
    }
}

function createMongoClientPromise(): Promise<MongoClient> {
    assertMongoConfig();

    const client = new MongoClient(MONGODB.URI as string);
    return client.connect();
}

async function getMongoDatabase(): Promise<Db> {
    const globalScope = globalThis as TMongoClientGlobal;

    if (!globalScope.__i2naMongoClientPromise) {
        globalScope.__i2naMongoClientPromise = createMongoClientPromise();
    }

    const client = await globalScope.__i2naMongoClientPromise;
    return client.db(MONGODB.DATABASE);
}

async function getCollection(collectionName: string): Promise<Collection> {
    const database = await getMongoDatabase();
    return database.collection(collectionName);
}

function normalizeMongoValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeMongoValue(item));
    }

    if (!value || typeof value !== "object") {
        return value;
    }

    if ("$oid" in (value as Record<string, unknown>)) {
        const oid = (value as { $oid?: unknown }).$oid;
        if (typeof oid === "string" && ObjectId.isValid(oid)) {
            return new ObjectId(oid);
        }

        return value;
    }

    const normalizedEntries = Object.entries(value as Record<string, unknown>).map(([key, next]) => [
        key,
        normalizeMongoValue(next),
    ]);

    return Object.fromEntries(normalizedEntries);
}

function normalizeMongoInput(input: TMongoInput | undefined): TMongoInput {
    if (!input) {
        return {};
    }

    return normalizeMongoValue(input) as TMongoInput;
}

export async function findMany<TDocument>(
    collection: string,
    options: {
        filter?: TMongoInput;
        sort?: Record<string, 1 | -1>;
        limit?: number;
        projection?: Record<string, unknown>;
    } = {}
): Promise<TDocument[]> {
    const collectionRef = await getCollection(collection);

    const cursor = collectionRef.find(normalizeMongoInput(options.filter) as TMongoInput, {
        ...(options.projection ? { projection: options.projection } : {}),
    });

    if (options.sort) {
        cursor.sort(options.sort);
    }

    if (typeof options.limit === "number") {
        cursor.limit(options.limit);
    }

    return (await cursor.toArray()) as TDocument[];
}

export async function findOne<TDocument>(
    collection: string,
    filter: TMongoInput
): Promise<TDocument | null> {
    const collectionRef = await getCollection(collection);
    return (await collectionRef.findOne(normalizeMongoInput(filter) as TMongoInput)) as TDocument | null;
}

export async function insertOne<TDocument>(
    collection: string,
    document: TDocument
): Promise<unknown> {
    const collectionRef = await getCollection(collection);
    const result = await collectionRef.insertOne(document as TMongoInput);

    return result.insertedId;
}

export async function updateOne(
    collection: string,
    filter: TMongoInput,
    update: TMongoInput,
    upsert = false
): Promise<IMongoUpdateResponse> {
    const collectionRef = await getCollection(collection);
    const result = await collectionRef.updateOne(
        normalizeMongoInput(filter),
        normalizeMongoInput(update),
        { upsert }
    );

    return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        ...(result.upsertedId ? { upsertedId: result.upsertedId } : {}),
    };
}

export async function updateMany(
    collection: string,
    filter: TMongoInput,
    update: TMongoInput
): Promise<IMongoUpdateResponse> {
    const collectionRef = await getCollection(collection);
    const result = await collectionRef.updateMany(
        normalizeMongoInput(filter),
        normalizeMongoInput(update)
    );

    return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        ...(result.upsertedId ? { upsertedId: result.upsertedId } : {}),
    };
}

export async function deleteOne(collection: string, filter: TMongoInput): Promise<IMongoDeleteResponse> {
    const collectionRef = await getCollection(collection);
    const result = await collectionRef.deleteOne(normalizeMongoInput(filter));

    return {
        deletedCount: result.deletedCount,
    };
}

export async function deleteMany(
    collection: string,
    filter: TMongoInput
): Promise<IMongoDeleteResponse> {
    const collectionRef = await getCollection(collection);
    const result = await collectionRef.deleteMany(normalizeMongoInput(filter));

    return {
        deletedCount: result.deletedCount,
    };
}
