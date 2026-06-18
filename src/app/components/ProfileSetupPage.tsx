import { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { GlassCard, LiquidButton, GlassInput, GlassTextarea, ProgressStepper, PillTagSelector, PrivacyNotice } from './GlassUI';
import type { PageName } from './GlassUI';
import { BRAND_NAME } from '../brand';

interface ProfileSetupPageProps {
  onNavigate: (page: PageName) => void;
}

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

const ageOptions = ['18-20岁', '21-23岁', '24-26岁', '27-30岁', '30岁以上'];
const expOptions = ['零经验', '有过暗恋', '恋爱过1次', '恋爱过多次'];
const stageOptions = ['喜欢但没表白', '暧昧中', '追求中', '已在一起'];
const confusionOptions = ['不知道说什么', '怕说错话', '读不懂她', '回复太慢很焦虑', '不敢推进', '不会表白'];
const styleOptions = ['话少内敛', '逗比活泼', '稳重踏实', '细腻体贴', '直接坦诚'];
const freqOptions = ['每天聊', '隔天聊', '一周几次', '断断续续'];
const likeOptions = ['咖啡', '猫猫', '旅行', '音乐', '电影', '美食', '健身', '读书', '游戏', '艺术'];
const triggerOptions = ['被催促', '被忽视', '说话不算数', '敷衍回复', '爹味说教'];
const relationOptions = ['陌生人', '普通朋友', '熟悉朋友', '暧昧关系'];

export function ProfileSetupPage({ onNavigate }: ProfileSetupPageProps) {
  const [myNickname, setMyNickname] = useState('');
  const [myAge, setMyAge] = useState<string[]>([]);
  const [myExp, setMyExp] = useState<string[]>([]);
  const [myStage, setMyStage] = useState<string[]>([]);
  const [myConfusion, setMyConfusion] = useState<string[]>([]);
  const [myStyle, setMyStyle] = useState<string[]>([]);
  const [anxious, setAnxious] = useState<string[]>([]);

  const [herName, setHerName] = useState('');
  const [knowDuration, setKnowDuration] = useState('');
  const [relation, setRelation] = useState<string[]>([]);
  const [freq, setFreq] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [importantDate, setImportantDate] = useState('');
  const [notes, setNotes] = useState('');

  const toggle = (arr: string[], val: string, setArr: (a: string[]) => void) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  return (
    <div style={{ padding: '32px 32px 120px', maxWidth: 960, margin: '0 auto' }} className="page-enter">
      {/* Stepper */}
      <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={0} />
      </GlassCard>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: 'var(--text-rose)', letterSpacing: '-0.03em' }}>
          资料建档
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          信息越准确，AI 分析越贴近真实情况；但不要填写未经允许的敏感隐私。
        </p>
      </div>

      {/* THE GRID wraps BOTH cards AND the notice — notice uses grid-column: 1/-1 to span full width */}
      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* 我的信息 */}
        <GlassCard className="hoverable-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#E8748A,#C5956C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 16 }}>👤</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-rose)' }}>我的信息</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <GlassInput label="昵称（可以不用真名）" placeholder="叫我什么都行" value={myNickname} onChange={setMyNickname} />

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>年龄段</label>
              <PillTagSelector options={ageOptions} selected={myAge} onToggle={v => toggle(myAge, v, setMyAge)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>恋爱经验</label>
              <PillTagSelector options={expOptions} selected={myExp} onToggle={v => toggle(myExp, v, setMyExp)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>当前阶段</label>
              <PillTagSelector options={stageOptions} selected={myStage} onToggle={v => toggle(myStage, v, setMyStage)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>主要困惑（可多选）</label>
              <PillTagSelector options={confusionOptions} selected={myConfusion} onToggle={v => toggle(myConfusion, v, setMyConfusion)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>沟通风格</label>
              <PillTagSelector options={styleOptions} selected={myStyle} onToggle={v => toggle(myStyle, v, setMyStyle)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>是否容易焦虑</label>
              <PillTagSelector options={['不太会', '偶尔焦虑', '经常焦虑', '非常焦虑']} selected={anxious} onToggle={v => toggle(anxious, v, setAnxious)} />
            </div>
          </div>
        </GlassCard>

        {/* 她的信息 */}
        <GlassCard className="hoverable-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#D4A5C9,#E8748A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 16 }}>🌸</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-rose)' }}>她的信息</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <GlassInput label="称呼（你对她的叫法）" placeholder="例如：小林、阿雅" value={herName} onChange={setHerName} />
            <GlassInput label="认识时长" placeholder="例如：3个月、半年" value={knowDuration} onChange={setKnowDuration} />

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>当前关系阶段</label>
              <PillTagSelector options={relationOptions} selected={relation} onToggle={v => toggle(relation, v, setRelation)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>联系频率</label>
              <PillTagSelector options={freqOptions} selected={freq} onToggle={v => toggle(freq, v, setFreq)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>喜好（已知的）</label>
              <PillTagSelector options={likeOptions} selected={likes} onToggle={v => toggle(likes, v, setLikes)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>雷点（她明确表达过的）</label>
              <PillTagSelector options={triggerOptions} selected={triggers} onToggle={v => toggle(triggers, v, setTriggers)} />
            </div>

            <GlassInput label="重要日子（生日等）" placeholder="例如：10月3日生日" value={importantDate} onChange={setImportantDate} />
            <GlassTextarea label="备注" placeholder="其他想记录的信息..." value={notes} onChange={setNotes} rows={3} />
          </div>
        </GlassCard>

        {/* Notice — grid-column: 1/-1 spans both cards exactly, INSIDE the grid */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="privacy-notice" style={{
            borderRadius: 20, padding: '16px 22px',
            display: 'flex', gap: 12, alignItems: 'center',
            boxShadow: '0 4px 24px rgba(196,160,112,0.12), inset 0 1px 0 rgba(255,255,255,0.65)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,rgba(196,160,112,0.2),rgba(255,248,240,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(196,160,112,0.25)' }}>
              <span style={{ fontSize: 18 }}>🔒</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--champagne-gold)', marginBottom: 3 }}>隐私说明 · {BRAND_NAME}</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.65 }}>
                本页信息仅用于优化 AI 分析结果，优先存储在本地，随时可清空。信息越准确，AI 分析越贴近真实情况；但不要填写未经允许的敏感隐私。
              </p>
            </div>
          </div>
        </div>
      </div>{/* end grid */}

      {/* Bottom actions */}
      <div
        className="profile-actionbar"
        style={{
          position: 'fixed', bottom: 0, left: 240, right: 0,
          padding: '16px 32px',
          background: 'rgba(255,245,248,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.4)',
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          alignItems: 'center',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <Info size={14} color="var(--text-purple)" style={{ opacity: 0.6 }} />
          <span style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.65 }}>填写越完整，AI 分析越准确</span>
        </div>
        <LiquidButton variant="secondary" onClick={() => onNavigate('dashboard')}>
          稍后补充
        </LiquidButton>
        <LiquidButton onClick={() => onNavigate('male-questionnaire')}>
          保存并继续
          <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
