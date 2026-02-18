interface IMongoObjectIdValue {
    $oid: string;
}

interface IMongoDocumentWithId {
    _id?: unknown;
}

export function getDocumentId(document: IMongoDocumentWithId): string {
    if (!document._id) {
        return "";
    }

    if (typeof document._id === "string") {
        return document._id;
    }

    if (
        typeof document._id === "object" &&
        document._id !== null &&
        "$oid" in document._id &&
        typeof (document._id as IMongoObjectIdValue).$oid === "string"
    ) {
        return (document._id as IMongoObjectIdValue).$oid;
    }

    if (
        typeof document._id === "object" &&
        document._id !== null &&
        "toHexString" in document._id &&
        typeof (document._id as { toHexString?: unknown }).toHexString === "function"
    ) {
        return String((document._id as { toHexString: () => string }).toHexString());
    }

    if (
        typeof document._id === "object" &&
        document._id !== null &&
        "toString" in document._id &&
        typeof (document._id as { toString?: unknown }).toString === "function"
    ) {
        return String((document._id as { toString: () => string }).toString());
    }

    return "";
}
