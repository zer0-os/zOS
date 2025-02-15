// Import your function and any necessary dependencies
import { constructFallbackForParentMessage, getFilteredMembersForAutoComplete, parsePlainBody } from './utils';

// Example room members data
const roomMembers: any[] = [
  {
    userId: '@domw:zero-synapse-development.zer0.io',
    matrixId: '@domw:zero-synapse-development.zer0.io',
    firstName: 'domw',
    profileImage: '',
  },
  {
    userId: '6fec1869-4608-4f7e-ab32-e50376b58e30',
    matrixId: '@dale.fukami:zero-synapse-development.zer0.io',
    firstName: 'dale.fukami',
    lastName: '',
    profileId: 'a9d1b1a5-dc43-4860-93b6-fb63ee3ca911',
    profileImage: '',
  },
];

describe('getFilteredMembersForAutoComplete', () => {
  it('should return empty array if no matching members', async () => {
    const filter = 'xyz'; // No matching members
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    expect(result).toEqual([]);
  });

  it('should return filtered members based on display name', async () => {
    const filter = 'da';
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect members with 'da' in display name
    expect(result).toEqual([
      {
        id: '6fec1869-4608-4f7e-ab32-e50376b58e30',
        displayName: 'dale.fukami ',
        profileImage: '',
      },
    ]);
  });

  it('should return case-insensitive results', async () => {
    const filter = 'dOmW'; // Case-insensitive filter
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect members with 'ratik21' in display name
    expect(result).toEqual([
      {
        id: 'domw',
        displayName: 'domw ',
        profileImage: '',
      },
    ]);
  });

  it('should return all members if filter is empty', async () => {
    const filter = ''; // Empty filter
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect all members
    expect(result).toEqual([
      {
        id: 'domw',
        displayName: 'domw ',
        profileImage: '',
      },
      {
        id: '6fec1869-4608-4f7e-ab32-e50376b58e30',
        displayName: 'dale.fukami ',
        profileImage: '',
      },
    ]);
  });

  it('should match the filter being case insensitive', async () => {
    roomMembers[0].firstName = 'DOMW';

    const filter = 'dom';
    const result = await getFilteredMembersForAutoComplete(roomMembers, filter);
    // Expect members with 'do' in display name
    expect(result).toEqual([
      {
        id: 'domw',
        displayName: 'DOMW ',
        profileImage: '',
      },
    ]);
  });

  it('should correctly parse matrix IDs with server suffix', async () => {
    const testMembers = [
      ...roomMembers,
      {
        // Test case with matrixId in @uuid:server format
        userId: undefined, // seems like desktop app isn't sending userId?
        matrixId: '@a72a05d0-babe-47ca-b168-f4eb18f7acdc:zos-dev.zer0.io',
        firstName: 'serveruser',
        lastName: '',
        profileImage: '',
      },
    ];

    const filter = 'ser';
    const result = await getFilteredMembersForAutoComplete(testMembers, filter);

    expect(result).toEqual([
      {
        id: 'a72a05d0-babe-47ca-b168-f4eb18f7acdc', // Should extract UUID from matrixId
        displayName: 'serveruser ',
        profileImage: '',
      },
    ]);
  });
});

describe(constructFallbackForParentMessage, () => {
  it('constructs fallback content correctly for a valid parent message', () => {
    const parentMessage = {
      messageId: 123,
      sender: { matrixId: '@user:example.org' },
      message: 'This is the first line\nThis is the second line',
    };

    const fallback = constructFallbackForParentMessage(parentMessage);

    expect(fallback).toEqual('> <@user:example.org> This is the first line\n> This is the second line');
  });

  it('returns an empty string if parent message is empty', () => {
    const parentMessage = { messageId: 123, sender: { matrixId: '@user:example.org' }, message: '' };

    const fallback = constructFallbackForParentMessage(parentMessage);

    expect(fallback).toEqual('');
  });
});

describe(parsePlainBody, () => {
  it("filters out lines starting with '> '", () => {
    const body = '> <@user:example.org> This is the first line\n> This is the second line\n\nThis is the reply message';
    const expected = 'This is the reply message';

    expect(parsePlainBody(body)).toEqual(expected);
  });

  it('returns an empty string if all lines are whitespace or quoted', () => {
    const body = '> Quoted line\n    \n> Another quoted line';
    expect(parsePlainBody(body)).toEqual('');
  });

  it('preserves intentional formatting within the message', () => {
    const body = '> Quoted line\n\nIntentionally formatted message\nWith multiple lines';
    const expected = 'Intentionally formatted message\nWith multiple lines';
    expect(parsePlainBody(body)).toEqual(expected);
  });

  it('removes leading and trailing whitespace around the message', () => {
    const body = '\n\n> Quoted line\n\nMessage with leading and trailing whitespace\n\n';
    const expected = 'Message with leading and trailing whitespace';
    expect(parsePlainBody(body)).toEqual(expected);
  });

  it('preserves URLs that follow a quoted line', () => {
    const body = '> Quoted text\nhttps://example.com';
    const expected = 'https://example.com';
    expect(parsePlainBody(body)).toEqual(expected);
  });

  it('handles messages with URLs surrounded by whitespace', () => {
    const body = '\n\n https://example.com \n\n';
    const expected = 'https://example.com';
    expect(parsePlainBody(body)).toEqual(expected);
  });

  it('keeps URLs intact within complex messages', () => {
    const body = '> Quoted line\n\nBefore URL text\nhttps://example.com\nAfter URL text';
    const expected = 'Before URL text\nhttps://example.com\nAfter URL text';
    expect(parsePlainBody(body)).toEqual(expected);
  });
});
