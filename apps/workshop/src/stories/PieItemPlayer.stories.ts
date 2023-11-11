import {html} from 'lit';
import {Meta, StoryObj} from "@storybook/web-components";
import {Env} from "@pie-wc/shared";
import '@pie-wc/shared';
import item from './data/item-cc036ed6-3022-4496-8fb5-e7e3cdfa2af7.json';

type PieItemPlayerArgs = {
    mode?: 'gather' | 'view' | 'evaluate';
    role?: 'instructor' | 'student';
}

const meta: Meta<PieItemPlayerArgs> = {
    component: 'pie-item-player-test',
    argTypes: {
        mode: {
            options: ['gather', 'view', 'evaluate'],
            control: {type: 'select'},
            defaultValue: 'gather',
            description: 'The interaction mode'
        },
        role: {
            options: ['instructor', 'student'],
            control: {type: 'select'},
            defaultValue: 'student',
            description: 'The role of the user'
        },
    },
};
export default meta;

type Story = StoryObj;

const StoryWrapper = (args: PieItemPlayerArgs) => {
    const env = {mode: args.mode, role: args.role} as Env;
    return html`
        <pie-item-player .env=${env}
                         .item=${item}>
        </pie-item-player>`;
};

export const Primary: Story = {
    args: {
        mode: 'gather',
        role: 'student',
    },
    render: StoryWrapper
};
