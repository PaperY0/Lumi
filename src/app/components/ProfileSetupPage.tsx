import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Info } from 'lucide-react';
import { GlassCard, LiquidButton, GlassInput, GlassTextarea, ProgressStepper, PillTagSelector } from './GlassUI';
import type { PageName } from './GlassUI';
import { BRAND_NAME } from '../brand';
// ✅ 表单校验 + 类型
import { userProfileSchema, type ProfileFormValues } from '@/lib/validation/profileSchema';
// ✅ 数据库 repository（真正落库）
import { userProfileRepository } from '@/lib/db';
// ✅ 全局 store：用户身份 + UI 提示
import { useUserStore, useUiStore } from '@/stores';

interface ProfileSetupPageProps {
  onNavigate: (page: PageName) => void;
}

const steps = ['资料建档', '男生问卷', '女生问卷', '关系画像', '聊天导入'];

// ✅ 年龄段按钮改为 4 档，与 schema 的 ageRange 枚举一一对齐
const ageOptions = ['18-22岁', '23-27岁', '28-32岁', '33岁以上'];
const expOptions = ['零经验', '有过暗恋', '恋爱过1次', '恋爱过多次'];
const stageOptions = ['喜欢但没表白', '暧昧中', '追求中', '已在一起'];
const confusionOptions = ['不知道说什么', '怕说错话', '读不懂她', '回复太慢很焦虑', '不敢推进', '不会表白'];
const styleOptions = ['话少内敛', '逗比活泼', '稳重踏实', '细腻体贴', '直接坦诚'];
const anxiousOptions = ['不太会', '偶尔焦虑', '经常焦虑', '非常焦虑'];

// ── 她的信息（本次不接库，保留为本地 state）用到的选项 ──
const freqOptions = ['每天聊', '隔天聊', '一周几次', '断断续续'];
const likeOptions = ['咖啡', '猫猫', '旅行', '音乐', '电影', '美食', '健身', '读书', '游戏', '艺术'];
const triggerOptions = ['被催促', '被忽视', '说话不算数', '敷衍回复', '爹味说教'];
const relationOptions = ['陌生人', '普通朋友', '熟悉朋友', '暧昧关系'];

// ✅ 「界面文字 ↔ 枚举值」映射层：UI 显示中文，存库用 schema 枚举
const ageLabelToValue: Record<string, ProfileFormValues['ageRange']> = {
  '18-22岁': '18-22', '23-27岁': '23-27', '28-32岁': '28-32', '33岁以上': '33+',
};
const expLabelToValue: Record<string, ProfileFormValues['loveExperience']> = {
  '零经验': 'none', '有过暗恋': 'little', '恋爱过1次': 'some', '恋爱过多次': 'rich',
};
const stageLabelToValue: Record<string, ProfileFormValues['relationshipStatus']> = {
  '喜欢但没表白': 'single', '暧昧中': 'ambiguous', '追求中': 'pursuing', '已在一起': 'dating',
};

/** 反转映射：枚举值 → 界面文字（回填时用） */
function invert<V extends string>(m: Record<string, V>): Record<V, string> {
  const out = {} as Record<V, string>;
  for (const k in m) out[m[k]] = k;
  return out;
}
const ageValueToLabel = invert(ageLabelToValue);
const expValueToLabel = invert(expLabelToValue);
const stageValueToLabel = invert(stageLabelToValue);

// ✅ 多选标签 ↔ 单个字符串（用「、」分隔）互转，给 mainConfusion / chatStyle 用
const splitToArr = (v?: string) => (v ? v.split('、').filter(Boolean) : []);
const toggleInString = (current: string | undefined, val: string) => {
  const arr = splitToArr(current);
  const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  return next.join('、');
};

// ✅ 是否容易焦虑：4 档界面 → boolean（经常/非常 = true）。回填时按 boolean 取代表性标签高亮
const anxiousLabelToBool: Record<string, boolean> = {
  '不太会': false, '偶尔焦虑': false, '经常焦虑': true, '非常焦虑': true,
};

export function ProfileSetupPage({ onNavigate }: ProfileSetupPageProps) {
  // ✅ 「我的信息」改由 react-hook-form 接管（删除了原来的 myNickname/myAge/... 等 useState）
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      nickname: '',
      mainConfusion: '',
      // 枚举字段不设默认值，留空让用户选
    },
  });

  // ── 「她的信息」本次不接库，保留为本地 state（与原文件一致）──
  const [herName, setHerName] = useState('');
  const [knowDuration, setKnowDuration] = useState('');
  const [relation, setRelation] = useState<string[]>([]);
  const [freq, setFreq] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [importantDate, setImportantDate] = useState('');
  const [notes, setNotes] = useState('');

  const toggle = (arr: string[], val: string, setArr: (a: string[]) => void) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  // ✅ 挂载时加载已有资料并回填表单
  useEffect(() => {
    useUserStore.getState().loadCurrentUser().then(() => {
      const existing = useUserStore.getState().currentUser;
      if (existing) {
        form.reset({
          nickname: existing.nickname,
          ageRange: existing.ageRange,
          relationshipStatus: existing.relationshipStatus,
          loveExperience: existing.loveExperience,
          mainConfusion: existing.mainConfusion,
          mbti: existing.mbti,
          selfPersonality: existing.selfPersonality,
          communicationHabit: existing.communicationHabit,
          emotionExpression: existing.emotionExpression,
          chatStyle: existing.chatStyle,
          isAnxious: existing.isAnxious,
          isProactive: existing.isProactive,
        });
      }
    });
    // 仅挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 提交：校验通过后真正落库 + 更新 store + toast + 跳转
  const onSubmit = async (data: ProfileFormValues) => {
    const ui = useUiStore.getState();
    const userStore = useUserStore.getState();
    try {
      ui.showLoading('保存中...');
      const saved = await userProfileRepository.save({
        ...(userStore.currentUser ?? {}),
        ...data,
      });
      userStore.setCurrentUser(saved);
      ui.showToast('资料已保存', 'success');
      onNavigate('male-questionnaire');
    } catch (e) {
      ui.showToast('保存失败：' + (e as Error).message, 'error');
    } finally {
      ui.hideLoading();
    }
  };

  const errors = form.formState.errors;

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
            {/* ✅ 昵称：GlassInput 用自定义 onChange，故用 Controller 绑定 */}
            <div>
              <Controller
                name="nickname"
                control={form.control}
                render={({ field }) => (
                  <GlassInput label="昵称（可以不用真名）" placeholder="叫我什么都行" value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
              {errors.nickname && (
                <p className="text-red-500 text-sm mt-1" style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.nickname.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>年龄段</label>
              {/* ✅ PillTagSelector 单选，用 Controller；界面文字↔枚举值 通过映射转换 */}
              <Controller
                name="ageRange"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={ageOptions}
                    selected={field.value ? [ageValueToLabel[field.value]] : []}
                    onToggle={(label) => field.onChange(ageLabelToValue[label])}
                  />
                )}
              />
              {errors.ageRange && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.ageRange.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>恋爱经验</label>
              <Controller
                name="loveExperience"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={expOptions}
                    selected={field.value ? [expValueToLabel[field.value]] : []}
                    onToggle={(label) => field.onChange(expLabelToValue[label])}
                  />
                )}
              />
              {errors.loveExperience && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.loveExperience.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>当前阶段</label>
              {/* ✅ 「当前阶段」映射到 schema 的 relationshipStatus */}
              <Controller
                name="relationshipStatus"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={stageOptions}
                    selected={field.value ? [stageValueToLabel[field.value]] : []}
                    onToggle={(label) => field.onChange(stageLabelToValue[label])}
                  />
                )}
              />
              {errors.relationshipStatus && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.relationshipStatus.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>主要困惑（可多选）</label>
              {/* ✅ 多选：拼成「、」分隔字符串存 mainConfusion */}
              <Controller
                name="mainConfusion"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={confusionOptions}
                    selected={splitToArr(field.value)}
                    onToggle={(v) => field.onChange(toggleInString(field.value, v))}
                  />
                )}
              />
              {errors.mainConfusion && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.mainConfusion.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>沟通风格</label>
              {/* ✅ 多选：拼成字符串存 chatStyle（可选） */}
              <Controller
                name="chatStyle"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={styleOptions}
                    selected={splitToArr(field.value)}
                    onToggle={(v) => field.onChange(toggleInString(field.value, v))}
                  />
                )}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>是否容易焦虑</label>
              {/* ✅ 4 档界面 → boolean（经常/非常焦虑 = true）；回填按 boolean 取代表标签高亮 */}
              <Controller
                name="isAnxious"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={anxiousOptions}
                    selected={field.value === undefined ? [] : field.value ? ['经常焦虑'] : ['不太会']}
                    onToggle={(label) => field.onChange(anxiousLabelToBool[label])}
                  />
                )}
              />
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
        {/* ✅ 保存按钮接 RHF：handleSubmit 先校验再 onSubmit；提交中禁用 */}
        <LiquidButton onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>
          保存并继续
          <ArrowRight size={16} />
        </LiquidButton>
      </div>
    </div>
  );
}
