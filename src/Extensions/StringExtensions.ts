import lodash from 'lodash';
import { Maybe } from '@vladbasin/ts-types';

declare global {
    interface String {
        isTrimmed(): boolean;
        ensureFirstCapitalized(): string;
        ensureEndsWith(target: string): string;
        ensureStartsWith(target: string): string;
        getAllWordsLowerCased(): string[];
        replaceRegex(pattern: string, replacement: string): string;
        asUrlExtractFileName(): string | undefined;
        asUrlExtractFileExtension(): Maybe<string>;
        asUrlExtractFileNameWithoutExtension(): string | undefined;
        escapeForFileSystemPath(): string;
        extractChunkBySplitting(separator: string, chunkIndex: number): string | undefined;
        trimStartFor(target: string): string,
        trimEndFor(target: string): string,
        compactMap(selector: (currentChar: string, prevChar?: string) => Maybe<string>): string,
        ensureMaxLength(maxLength: number): string,
    }
}

String.prototype.ensureMaxLength = function(maxLength: number) {
    const target = this.toString();

    if (target.length <= maxLength) {
        return target;
    }

    const overLength = target.length - maxLength;
    const firstSkipLength = target.length / 2 - overLength / 2;

    return `${target.slice(0, firstSkipLength)}_${target.slice(target.length - firstSkipLength, target.length)}`;
}

String.prototype.compactMap = function(selector: (currentChar: string, prevChar?: string) => Maybe<string>) {
    let index = 0;
    let result = "";

    while (index < this.length) {
        const prevChar = index > 0 
            ? result[index - 1]
            : undefined;

        const selectedChar = selector(result[index], prevChar);

        if (selectedChar) {
            result += selectedChar;
        }

        index++;
    }

    return result;
}

String.prototype.trimStartFor = function(target: string) {
    return this.startsWith(target) 
        ? this.substr(target.length)
        : this.toString();
}

String.prototype.trimEndFor = function(target: string) {
    return this.endsWith(target) 
        ? this.substr(0, this.length - target.length)
        : this.toString();
}

String.prototype.isTrimmed = function() {
    return this.trim() === this.toString();
}

String.prototype.ensureFirstCapitalized = function() {
    return lodash.upperFirst(this.toString());
}

String.prototype.replaceRegex = function(pattern: string, replacement: string) {
    return this.replace(new RegExp(escapeRegexp(pattern), 'g'), replacement);
};

String.prototype.getAllWordsLowerCased = function() {
    let textWithoutStops = ",.;'!/\"[]{}()*&^%$#@!-_=+\\|"
        .split('')
        .reduce((prev, stopChar) => prev.replaceRegex(stopChar, ' '), this);

    var wordSet = textWithoutStops
        .toLowerCase()
        .split(' ')
        .map(word => word.trim())
        .filter(word => word && !!word)
        .reduce((prev, current) => prev.add(current), new Set<string>());

    return Array.from(wordSet.keys());
}

String.prototype.asUrlExtractFileName = function() {
    const lastChunk = this.split('/').pop();
    const queryChunk = lastChunk && lastChunk.extractChunkBySplitting("#", 0);
    
    return queryChunk && queryChunk.extractChunkBySplitting("?", 0);
}

String.prototype.asUrlExtractFileNameWithoutExtension = function() {
    const withExtension = this.asUrlExtractFileName();

    return withExtension && withExtension.extractChunkBySplitting(".", 0);
}

String.prototype.asUrlExtractFileExtension = function() {
    const fileName = this.asUrlExtractFileName();
    
    return fileName && fileName.extractChunkBySplitting(".", 1);
}

String.prototype.escapeForFileSystemPath = function() {
    return this.replace(/[/\\?%*:|"<>]/g, '-');
}

String.prototype.ensureEndsWith = function(target: string) {
    return this.endsWith(target)
        ? this.toString()
        : this + target;
}

String.prototype.ensureStartsWith = function(target: string) {
    return this.startsWith(target)
        ? this.toString()
        : target + this;
}

String.prototype.extractChunkBySplitting = function(separator: string, chunkIndex: number) {
    const result = this.split(separator);

    return result.length > chunkIndex
        ? result[chunkIndex]
        : undefined;
}

function escapeRegexp(regex: string) {
    return regex.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}